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
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "@ronradtke/react-native-markdown-display";
import api from "@/utils/api";
import { useMenuStore } from "@/store/blog_store";

const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_GAP = 8;
const IMAGE_COLS = 3;
// Subtract: screen padding (16*2) + avatar width (28) + avatar margin (8)
const GRID_WIDTH = SCREEN_WIDTH - 32 - 36;
const IMAGE_SIZE = (GRID_WIDTH - IMAGE_GAP * (IMAGE_COLS - 1)) / IMAGE_COLS;

type UserMessage = { type: "user"; topic: string };
type AssistantMessage = {
  type: "assistant";
  markdown: string;
  images: string[];
  path?: string;
};
type Message = UserMessage | AssistantMessage;

export default function CreateBlogScreen() {
  const addMenuItem = useMenuStore((s) => s.addMenuItem);
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const listRef = useRef<FlatList<Message> | null>(null);

  const handleSend = async () => {
    const trimmed = topic.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { type: "user", topic: trimmed }]);
    setTopic("");
    setConfirmed(true);
    setLoading(true);

    try {
      // 90s timeout only on this call — blog gen (LLM + research + images) is slow.
      // Other api calls across the app are unaffected.
      const { data } = await api.post(
        "/blogs/create",
        { topic: trimmed },
        { timeout: 90000 },
      );
      // data: { title, path, images }

      // Fetch raw markdown content served as static file from FastAPI:
      // app.mount("/blog_files", StaticFiles(directory="blog_files")) in main.py
      const mdRes = await api.get(`/${data.path}`, {
        transformResponse: (res) => res, // keep raw text, don't JSON.parse it
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
      //! save to local store
      addMenuItem({
        title: data.title,
        file_path: data.path,
        images: data.images || [],
      });
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

    // Group into rows of IMAGE_COLS for reliable pixel-based layout
    const rows: string[][] = [];
    for (let i = 0; i < images.length; i += IMAGE_COLS) {
      rows.push(images.slice(i, i + IMAGE_COLS));
    }

    return (
      <View style={styles.imageGrid}>
        <Text style={styles.imagesLabel}>Related Images</Text>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.imageRow}>
            {row.map((url, colIdx) => (
              <Image
                key={colIdx}
                source={{ uri: url }}
                style={[
                  styles.imageBox,
                  { marginLeft: colIdx > 0 ? IMAGE_GAP : 0 },
                ]}
                resizeMode="cover"
                onError={() => {}}
              />
            ))}
          </View>
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

  listContent: { padding: 16, paddingBottom: 24 },

  // User bubble
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

  // Assistant bubble
  assistantRow: { flexDirection: "row", marginBottom: 16 },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 2,
  },
  assistantContent: { flex: 1 },
  assistantBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 14,
  },

  // Image grid
  imageGrid: {
    marginTop: 12,
  },
  imagesLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  imageRow: {
    flexDirection: "row",
    marginBottom: IMAGE_GAP,
  },
  imageBox: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },

  // Loading
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  loadingText: { color: "#6b7280", fontSize: 13 },

  // Input bar
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
