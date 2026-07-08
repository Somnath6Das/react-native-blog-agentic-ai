import React, { useState, useRef, useCallback, useEffect } from "react";
import { ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "@/utils/api";
import { useMenuStore } from "@/store/blog_store";
import { useFocusEffect } from "expo-router";
import useAuthStore from "@/store/auth_store";
import BlogMain from "@/components/BlogMain";

const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_GAP = 8;
const IMAGE_COLS = 3;
// Subtract: screen padding (16*2) + avatar width (28) + avatar margin (8)
const GRID_WIDTH = SCREEN_WIDTH - 32 - 36;
const IMAGE_SIZE = (GRID_WIDTH - IMAGE_GAP * (IMAGE_COLS - 1)) / IMAGE_COLS;

type UserMessage = { type: "user"; topic: string };
type AssistantMessage = {
  type: "assistant";
  html: string;
  images: string[];
  path?: string;
};
type Message = UserMessage | AssistantMessage;

export default function CreateBlogScreen() {
  const resetKey = useMenuStore((s) => s.resetKey);
  const addMenuItem = useMenuStore((s) => s.addMenuItem);
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const listRef = useRef<ScrollView | null>(null);
  const [postId, setPostId] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      setTopic("");
      setMessages([]);
      setConfirmed(false);
      setLoading(false);
    }, []),
  );
  useEffect(() => {
    setTopic("");
    setMessages([]);
    setConfirmed(false);
    setLoading(false);
  }, [resetKey]);
  const handleSend = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || loading) return;

    setMessages((prev) => [...prev, { type: "user", topic: trimmedTopic }]);
    setTopic("");
    setConfirmed(true);
    setLoading(true);

    try {
      // 90s timeout only on this call — blog gen (LLM + research + images) is slow.
      // Other api calls across the app are unaffected.
      const { data } = await api.post(
        "/blogs/create",
        { topic: trimmedTopic },
        { timeout: 90000 },
      );

      // data: { title, path, images }

      // Fetch the generated HTML content served as a static file from FastAPI:
      // app.mount("/blog_files", StaticFiles(directory="blog_files")) in main.py
      const htmlRes = await api.get(`/${data.path}`, {
        transformResponse: (res) => res, // keep raw text, don't JSON.parse it
      });

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          html: htmlRes.data,
          images: data.images || [],
          path: data.path,
        },
      ]);
      const newId = addMenuItem({
        user_topic: trimmedTopic,
        title: data.title,
        file_path: data.path,
        images: data.images || [],
      });
      setTitle(data.title);
      setPostId(newId);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail || err.message || "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { type: "assistant", html: `⚠️ ${detail}`, images: [] },
      ]);
    } finally {
      setLoading(false);
      // setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    }
  };

  return (
    <BlogMain
      messages={messages}
      handleSend={handleSend}
      postId={postId}
      title={title}
      topic={topic}
      setTopic={setTopic}
      loading={loading}
      confirmed={confirmed}
      listRef={listRef}
    />
  );
}
