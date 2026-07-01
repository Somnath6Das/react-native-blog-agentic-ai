import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "@ronradtke/react-native-markdown-display";
import api from "@/utils/api"; // shared axios instance (AiBlog/src/utils/api.ts)

type UserMessage = { type: "user"; topic: string };
type AssistantMessage = {
  type: "assistant";
  markdown: string;
  images: string[];
  path?: string;
};
type Message = UserMessage | AssistantMessage;

/**
 * Each entry in `messages` is either:
 *  { type: "user", topic: string }
 *  { type: "assistant", markdown: string, images: string[], path?: string }
 */

export default function CreateBlogScreen() {
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false); // hides the input once a topic is sent
  const listRef = useRef<FlatList<Message> | null>(null);

  const handleSend = async () => {
    const trimmed = topic.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { type: "user", topic: trimmed }]);
    setTopic("");
    setConfirmed(true);
    setLoading(true);

    try {
      // 1) Kick off blog generation.
      // 90s timeout only on this call — blog gen (LLM + research + images) is slow.
      // Other api calls across the app are unaffected.
      const { data } = await api.post(
        "/blogs/create",
        { topic: trimmed },
        {
          timeout: 90000,
        },
      );
      // data: { title, path, images }

      // 2) Fetch the actual markdown content from the returned path.
      //    Your server serves blog_files/ as static files via:
      //    app.mount("/blog_files", StaticFiles(directory="blog_files")) in main.py
      //    so GET {API_URL}/{path} returns the raw markdown text.
      const mdRes = await api.get(`/${data.path}`, {
        transformResponse: (res) => res, // keep raw text, don't let axios try to JSON.parse it
      });

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          markdown: mdRes.data,
          images: data.images || [],
          path: data.path,
        },
      ]);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail || err.message || "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { type: "assistant", markdown: `⚠️ ${detail}`, images: [] },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderImageGrid = (images: string[] | undefined) => {
    if (!images || images.length === 0) return null;
    return (
      <View style={styles.imageGrid}>
        {images.slice(0, 6).map((url, idx) => (
          <Image
            key={idx}
            source={{ uri: url }}
            style={styles.imageBox}
            resizeMode="cover"
            // If a hotlinked image (e.g. lookaside.fbsbx.com) fails to load,
            // it will just render the box background — no crash.
            onError={() => {}}
          />
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Message }) => {
    if (item.type === "user") {
      return (
        <View style={styles.userRow}>
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{item.topic}</Text>
          </View>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>U</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.assistantRow}>
        <View style={styles.assistantAvatar}>
          <Ionicons name="sparkles" size={14} color="#fff" />
        </View>
        <View style={styles.assistantContent}>
          <View style={styles.assistantBubble}>
            <Markdown style={markdownStyles}>{item.markdown}</Markdown>
          </View>
          {renderImageGrid(item.images)}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
        />

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#16a34a" />
            <Text style={styles.loadingText}>Generating your blog…</Text>
          </View>
        )}

        {/* Input — only shown before a topic has been confirmed */}
        {!confirmed && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="I'd love to know more"
              placeholderTextColor="#9ca3af"
              value={topic}
              onChangeText={setTopic}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={!topic.trim()}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },

  listContent: { padding: 16, paddingBottom: 24 },

  userRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  userBubble: {
    backgroundColor: "#f1f3f5",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: "75%",
    marginRight: 8,
  },
  userText: { fontSize: 15, color: "#111827" },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  assistantRow: { flexDirection: "row", marginBottom: 16 },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  assistantContent: { flex: 1 },
  assistantBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 14,
  },

  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 10,
  },
  imageBox: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  loadingText: { color: "#6b7280", fontSize: 13 },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});

const markdownStyles = {
  body: { fontSize: 15, color: "#111827", lineHeight: 22 },
  heading1: { fontSize: 20, fontWeight: "700" as const, marginBottom: 8 },
  heading2: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginTop: 10,
    marginBottom: 6,
  },
  code_inline: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
  },
};
