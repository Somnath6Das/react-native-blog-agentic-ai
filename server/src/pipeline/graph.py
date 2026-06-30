from __future__ import annotations

import json
import os
import operator
from pathlib import Path
from typing import TypedDict, List, Annotated, Literal, Optional

from dotenv import load_dotenv
from pydantic import BaseModel, Field

from langgraph.graph import StateGraph, START, END
from langgraph.types import Send

from langchain_groq import ChatGroq
from langchain_nvidia_ai_endpoints import ChatNVIDIA  # noqa: F401 (kept for easy provider swap)

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_tavily import TavilySearch

load_dotenv()


# -----------------------------
# 1) Schemas
# -----------------------------
class Task(BaseModel):
    id: int
    title: str

    goal: str = Field(
        ...,
        description="One sentence describing what the reader should be able to do/understand after this section.",
    )
    bullets: List[str] = Field(
        ...,
        min_length=3,
        max_length=6,
        description="3–6 concrete, non-overlapping subpoints to cover in this section.",
    )
    target_words: int = Field(..., description="Target word count for this section (120–550).")

    tags: List[str] = Field(default_factory=list)
    requires_research: bool = False
    requires_citations: bool = False
    requires_code: bool = False


class Plan(BaseModel):
    blog_title: str
    audience: str
    tone: str
    blog_kind: Literal["explainer", "tutorial", "news_roundup", "comparison", "system_design"] = "explainer"
    constraints: List[str] = Field(default_factory=list)
    tasks: List[Task]


class EvidenceItem(BaseModel):
    title: str
    url: str
    published_at: Optional[str] = None  # keep if Tavily provides; DO NOT rely on it
    snippet: Optional[str] = None
    source: Optional[str] = None


class RouterDecision(BaseModel):
    needs_research: bool
    mode: Literal["closed_book", "hybrid", "open_book"]
    queries: List[str] = Field(default_factory=list)


class EvidencePack(BaseModel):
    evidence: List[EvidenceItem] = Field(default_factory=list)


class State(TypedDict):
    topic: str

    # routing / research
    mode: str
    needs_research: bool
    queries: List[str]
    evidence: List[EvidenceItem]
    plan: Optional[Plan]

    # workers
    sections: Annotated[List[tuple[int, str]], operator.add]  # (task_id, section_md)
    final: str


# -----------------------------
# 2) LLM
# -----------------------------
llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=os.environ.get("GROQ_API_KEY")) # type: ignore

# Alternative providers (swap the assignment above if needed):
# llm = ChatNVIDIA(model="meta/llama-3.3-70b-instruct", api_key=os.environ.get("NVIDIA_API_KEY"))
# llm = ChatNVIDIA(model="qwen/qwen3.5-397b-a17b", api_key=os.environ.get("NVIDIA_API_KEY"))


# -----------------------------
# 3) Router (decide upfront)
# -----------------------------
ROUTER_SYSTEM = """You are a routing module for a technical blog planner.

Decide whether web research is needed BEFORE planning.

Modes:
- closed_book (needs_research=false):
  Evergreen topics where correctness does not depend on recent facts (concepts, fundamentals).
- hybrid (needs_research=true):
  Mostly evergreen but needs up-to-date examples/tools/models to be useful.
- open_book (needs_research=true):
  Mostly volatile: weekly roundups, "this week", "latest", rankings, pricing, policy/regulation.

If needs_research=true:
- Output 3–10 high-signal queries.
- Queries should be scoped and specific (avoid generic queries like just "AI" or "LLM").
- If user asked for "last week/this week/latest", reflect that constraint IN THE QUERIES.
"""


def router_node(state: State) -> dict:
    topic = state["topic"]
    decider = llm.with_structured_output(RouterDecision)
    decision = decider.invoke(
        [
            SystemMessage(content=ROUTER_SYSTEM),
            HumanMessage(content=f"Topic: {topic}"),
        ]
    )

    return {
        "needs_research": decision.needs_research, # type: ignore
        "mode": decision.mode, # type: ignore
        "queries": decision.queries, # type: ignore
    }


def route_next(state: State) -> str:
    return "research" if state["needs_research"] else "orchestrator"


# -----------------------------
# 4) Research (Tavily)
# -----------------------------
# Token-budget guard for Groq's 6k TPM free tier. We do NOT need an LLM to
# normalize Tavily results into EvidenceItem objects — that's pure code.
# Skip the LLM extraction step entirely and only fall back to it (chunked) if
# deterministic normalization yields nothing usable.
MAX_QUERIES = 3
MAX_RESULTS_PER_QUERY = 4
MAX_SNIPPET_CHARS = 400
MAX_TOTAL_CHARS = 4500  # safe margin under the 6k TPM limit (system + payload)
MAX_EVIDENCE_ITEMS = 20


def _tavily_search(query, max_results=5):
    raw = TavilySearch(max_results=max_results).invoke({"query": query})

    if isinstance(raw, dict):
        hits = raw.get("results") or []  # new langchain_tavily
    elif isinstance(raw, list):
        hits = raw  # old TavilySearchResults
    elif isinstance(raw, str):
        try:
            parsed = json.loads(raw)
            hits = parsed.get("results", []) if isinstance(parsed, dict) else parsed
        except json.JSONDecodeError:
            hits = []
    else:
        hits = []

    normalized = []
    for r in hits:
        if not isinstance(r, dict):
            continue
        normalized.append({
            "title": r.get("title") or "",
            "url": r.get("url") or "",
            "snippet": (r.get("content") or r.get("snippet") or "")[:MAX_SNIPPET_CHARS],
            "published_at": r.get("published_date") or r.get("published_at"),
            "source": r.get("source"),
        })
    return normalized


def _truncate_to_budget(blobs: List[dict], budget: int) -> List[dict]:
    out: List[dict] = []
    used = 0
    for b in blobs:
        s = json.dumps(b, ensure_ascii=False)
        if used + len(s) > budget and out:
            break
        out.append(b)
        used += len(s)
    return out


# Tiny fallback for the (rare) case where we want the LLM to filter/rank.
# We send at most one batch under the TPM budget instead of the full corpus.
RESEARCH_SYSTEM = """You are a research synthesizer for technical writing.

Given raw web search results, produce a deduplicated list of EvidenceItem objects.

Rules:
- Only include items with a non-empty url.
- Prefer relevant + authoritative sources (company blogs, docs, reputable outlets).
- If a published date is explicitly present in the result payload, keep it as YYYY-MM-DD.
  If missing or unclear, set published_at=null. Do NOT guess.
- Keep snippets short.
- Deduplicate by URL.
"""


def research_node(state: State) -> dict:
    queries = (state.get("queries", []) or [])[:MAX_QUERIES]

    raw_results: List[dict] = []
    for q in queries:
        raw_results.extend(_tavily_search(q, max_results=MAX_RESULTS_PER_QUERY))

    if not raw_results:
        return {"evidence": []}

    # 1) Deterministic normalization — no LLM, no token cost.
    deterministic: List[EvidenceItem] = []
    for r in raw_results:
        url = (r.get("url") or "").strip()
        if not url:
            continue
        published = r.get("published_at")
        # Only accept dates that look like YYYY-MM-DD; otherwise null.
        if not (isinstance(published, str) and len(published) >= 10 and published[4] in "-/"):
            published = None
        deterministic.append(
            EvidenceItem(
                title=(r.get("title") or "").strip()[:300],
                url=url,
                published_at=published,
                snippet=(r.get("snippet") or "").strip() or None,
                source=r.get("source"),
            )
        )

    # Deduplicate by URL, preserving order.
    seen: dict = {}
    for e in deterministic:
        if e.url and e.url not in seen:
            seen[e.url] = e
    evidence = list(seen.values())[:MAX_EVIDENCE_ITEMS]

    if evidence:
        return {"evidence": evidence}

    # 2) Last-resort LLM extraction, hard-capped to stay under the 6k TPM limit.
    blobs = _truncate_to_budget(raw_results, budget=MAX_TOTAL_CHARS)
    extractor = llm.with_structured_output(EvidencePack)
    try:
        pack = extractor.invoke(
            [
                SystemMessage(content=RESEARCH_SYSTEM),
                HumanMessage(content=f"Raw results:\n{json.dumps(blobs, ensure_ascii=False)}"),
            ]
        )
    except Exception as exc:  # pragma: no cover
        # If the provider still 413s, surface an empty evidence list and let
        # the orchestrator handle "insufficient sources" gracefully.
        print(f"[research_node] LLM extraction failed: {exc}")
        return {"evidence": []}

    dedup: dict = {}
    for e in pack.evidence: # type: ignore
        if e.url:
            dedup[e.url] = e
    return {"evidence": list(dedup.values())[:MAX_EVIDENCE_ITEMS]}


# -----------------------------
# 5) Orchestrator (Plan)
# -----------------------------
ORCH_SYSTEM = """You are a senior technical writer and developer advocate.
Your job is to produce a highly actionable outline for a technical blog post.

Hard requirements:
- Create 5–9 sections (tasks) suitable for the topic and audience.
- Each task must include:
  1) goal (1 sentence)
  2) 3–6 bullets that are concrete, specific, and non-overlapping
  3) target word count (120–550)

Quality bar:
- Assume the reader is a developer; use correct terminology.
- Bullets must be actionable: build/compare/measure/verify/debug.
- Ensure the overall plan includes at least 2 of these somewhere:
  * minimal code sketch / MWE (set requires_code=True for that section)
  * edge cases / failure modes
  * performance/cost considerations
  * security/privacy considerations (if relevant)
  * debugging/observability tips

Grounding rules:
- Mode closed_book: keep it evergreen; do not depend on evidence.
- Mode hybrid:
  - Use evidence for up-to-date examples (models/tools/releases) in bullets.
  - Mark sections using fresh info as requires_research=True and requires_citations=True.
- Mode open_book:
  - Set blog_kind = "news_roundup".
  - Every section is about summarizing events + implications.
  - DO NOT include tutorial/how-to sections unless user explicitly asked for that.
  - If evidence is empty or insufficient, create a plan that transparently says "insufficient sources"
    and includes only what can be supported.

Output must strictly match the Plan schema.
"""


def orchestrator_node(state: State) -> dict:
    planner = llm.with_structured_output(Plan)

    evidence = state.get("evidence", [])
    mode = state.get("mode", "closed_book")

    plan = planner.invoke(
        [
            SystemMessage(content=ORCH_SYSTEM),
            HumanMessage(
                content=(
                    f"Topic: {state['topic']}\n"
                    f"Mode: {mode}\n\n"
                    f"Evidence (ONLY use for fresh claims; may be empty):\n"
                    f"{[e.model_dump() for e in evidence][:16]}"
                )
            ),
        ]
    )

    # Guard: structured output returns None when the model doesn't support it
    if plan is None:
        raise ValueError(
            "orchestrator_node: LLM returned None for Plan. "
            "This usually means the model does not support structured output. "
            "Switch to a model that supports with_structured_output (e.g. meta/llama-3.3-70b-instruct)."
        )

    return {"plan": plan}


# -----------------------------
# 6) Fanout
# -----------------------------
def fanout(state: State):
    plan = state.get("plan")
    if plan is None:
        raise ValueError(
            "fanout: state['plan'] is None. The orchestrator_node did not produce a valid Plan. "
            "Check that your LLM model supports with_structured_output."
        )
    return [
        Send(
            "worker",
            {
                "task": task.model_dump(),
                "topic": state["topic"],
                "mode": state["mode"],
                "plan": plan.model_dump(),
                "evidence": [e.model_dump() for e in state.get("evidence", [])],
            },
        )
        for task in plan.tasks
    ]


# -----------------------------
# 7) Worker (write one section)
# -----------------------------
WORKER_SYSTEM = """You are a senior technical writer and developer advocate.
Write ONE section of a technical blog post in Markdown.

Hard constraints:
- Follow the provided Goal and cover ALL Bullets in order (do not skip or merge bullets).
- Stay close to Target words (±15%).
- Output ONLY the section content in Markdown (no blog title H1, no extra commentary).
- Start with a '## <Section Title>' heading.

Scope guard:
- If blog_kind == "news_roundup": do NOT turn this into a tutorial/how-to guide.
  Do NOT teach web scraping, RSS, automation, or "how to fetch news" unless bullets explicitly ask for it.
  Focus on summarizing events and implications.

Grounding policy:
- If mode == open_book:
  - Do NOT introduce any specific event/company/model/funding/policy claim unless it is supported by provided Evidence URLs.
  - For each event claim, attach a source as a Markdown link: ([Source](URL)).
  - Only use URLs provided in Evidence. If not supported, write: "Not found in provided sources."
- If requires_citations == true:
  - For outside-world claims, cite Evidence URLs the same way.
- Evergreen reasoning is OK without citations unless requires_citations is true.

Code:
- If requires_code == true, include at least one minimal, correct code snippet relevant to the bullets.

Style:
- Short paragraphs, bullets where helpful, code fences for code.
- Avoid fluff/marketing. Be precise and implementation-oriented.
"""


def worker_node(payload: dict) -> dict:
    task = Task(**payload["task"])
    plan = Plan(**payload["plan"])
    evidence = [EvidenceItem(**e) for e in payload.get("evidence", [])]
    topic = payload["topic"]
    mode = payload.get("mode", "closed_book")

    bullets_text = "\n- " + "\n- ".join(task.bullets)

    evidence_text = ""
    if evidence:
        evidence_text = "\n".join(
            f"- {e.title} | {e.url} | {e.published_at or 'date:unknown'}".strip()
            for e in evidence[:20]
        )

    section_md = llm.invoke(
        [
            SystemMessage(content=WORKER_SYSTEM),
            HumanMessage(
                content=(
                    f"Blog title: {plan.blog_title}\n"
                    f"Audience: {plan.audience}\n"
                    f"Tone: {plan.tone}\n"
                    f"Blog kind: {plan.blog_kind}\n"
                    f"Constraints: {plan.constraints}\n"
                    f"Topic: {topic}\n"
                    f"Mode: {mode}\n\n"
                    f"Section title: {task.title}\n"
                    f"Goal: {task.goal}\n"
                    f"Target words: {task.target_words}\n"
                    f"Tags: {task.tags}\n"
                    f"requires_research: {task.requires_research}\n"
                    f"requires_citations: {task.requires_citations}\n"
                    f"requires_code: {task.requires_code}\n"
                    f"Bullets:{bullets_text}\n\n"
                    f"Evidence (ONLY use these URLs when citing):\n{evidence_text}\n"
                )
            ),
        ]
    ).content.strip() # type: ignore

    return {"sections": [(task.id, section_md)]}


# -----------------------------
# 8) Reducer (merge)
# -----------------------------
def reducer_node(state: State) -> dict:
    plan = state["plan"]

    ordered_sections = [md for _, md in sorted(state["sections"], key=lambda x: x[0])]
    body = "\n\n".join(ordered_sections).strip()
    final_md = f"# {plan.blog_title}\n\n{body}\n" # type: ignore

    # NOTE: file writing is intentionally NOT done here. The FastAPI route
    # (blogs.py) owns filename generation (slug + uuid) and the blog_files/
    # output directory, so this node just returns the assembled markdown.
    return {"final": final_md}


# -----------------------------
# 9) Build graph
# -----------------------------
g = StateGraph(State)
g.add_node("router", router_node)
g.add_node("research", research_node)
g.add_node("orchestrator", orchestrator_node)
g.add_node("worker", worker_node)  # type: ignore
g.add_node("reducer", reducer_node)

g.add_edge(START, "router")
g.add_conditional_edges("router", route_next, {"research": "research", "orchestrator": "orchestrator"})
g.add_edge("research", "orchestrator")

g.add_conditional_edges("orchestrator", fanout, ["worker"])
g.add_edge("worker", "reducer")
g.add_edge("reducer", END)

app = g.compile()


# -----------------------------
# 10) Standalone runner (optional, for CLI/manual testing)
# -----------------------------
def run(topic: str) -> dict:
    out = app.invoke(
        {
            "topic": topic,
            "mode": "",
            "needs_research": False,
            "queries": [],
            "evidence": [],
            "plan": None,
            "sections": [],
            "final": "",
        }
    )
    return out


# if __name__ == "__main__":
#     result = run("Make fine tuning in 2026")
#     print(result["final"])