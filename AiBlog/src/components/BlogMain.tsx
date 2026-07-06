import { Dispatch, SetStateAction, memo, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RenderHtml from "react-native-render-html";
import useAuthStore from "@/store/auth_store";
import { padding } from "@expo/ui/jetpack-compose/modifiers";

const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_GAP = 8;
const IMAGE_COLS = 3;
// Subtract: screen padding (16*2) + avatar width (28) + avatar margin (8)
const GRID_WIDTH = SCREEN_WIDTH - 32 - 36;
const IMAGE_SIZE = (GRID_WIDTH - IMAGE_GAP * (IMAGE_COLS - 1)) / IMAGE_COLS;
// Content width for RenderHtml: safeArea padding (5*2) + avatar (28) +
// avatar margin (8) + bubble padding (14*2)
const HTML_CONTENT_WIDTH = SCREEN_WIDTH - 74;

type UserMessage = { type: "user"; topic: string };
type AssistantMessage = {
  type: "assistant";
  html: string;
  images: string[];
  path?: string;
};
type Message = UserMessage | AssistantMessage;
const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
// Replace with your actual image source
const AVATAR_URI = "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";

interface Props {
  messages: Message[];
  handleSend?: () => Promise<void>;
  topic?: string;
  setTopic?: Dispatch<SetStateAction<string>>;
  loading?: boolean;
  confirmed?: boolean;
  listRef: React.RefObject<ScrollView | null>;
}

// --- Memoized image grid ------------------------------------------------
// Recomputes row-chunking only when the `images` array reference changes.
const ImageGrid = memo(function ImageGrid({
  images,
}: {
  images: string[] | undefined;
}) {
  const rows = useMemo(() => {
    if (!images || images.length === 0) return [];
    const chunks: string[][] = [];
    for (let i = 0; i < images.length; i += IMAGE_COLS) {
      chunks.push(images.slice(i, i + IMAGE_COLS));
    }
    return chunks;
  }, [images]);

  if (rows.length === 0) return null;

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
});

// --- Memoized message row -------------------------------------------------
// React.memo skips re-rendering a row entirely if its `item` reference and
// `avatarUri` haven't changed, which is what actually silences the
// "large list slow to update" warning — otherwise every row re-renders
// (and RenderHtml re-parses its whole DOM tree) whenever the list re-renders.
const MessageRow = memo(function MessageRow({
  item,
  avatarUri,
}: {
  item: Message;
  avatarUri: string;
}) {
  if (item.type === "user") {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{item.topic}</Text>
        </View>
        <View style={styles.userAvatar}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
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
          <RenderHtml
            contentWidth={HTML_CONTENT_WIDTH}
            source={{ html: item.html }}
            tagsStyles={htmlStyles}
            renderersProps={{
              a: {
                onPress: (_event, href) => {
                  if (href) Linking.openURL(href);
                },
              },
            }}
          />
        </View>
        <ImageGrid images={item.images} />
      </View>
    </View>
  );
});

export default function BlogMain({
  messages,
  handleSend = async () => {},
  topic,
  setTopic = () => {},
  loading = false,
  confirmed = false,
  listRef,
}: Props) {
  const { user } = useAuthStore();

  const avatarUri = user?.avatar_url
    ? `${BASE_URL}${user.avatar_url}`
    : AVATAR_URI;

  // Stable, meaningful keys instead of array index — lets React correctly
  // diff items when messages are appended, instead of treating every row
  // after an insertion point as "changed".
  const keyExtractor = (item: Message, idx: number) =>
    item.type === "user" ? `u-${idx}` : `a-${item.path ?? idx}`;

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {confirmed ? (
          <>
            <ScrollView
              ref={listRef}
              contentContainerStyle={styles.listContent}
            >
              {messages.map((item, idx) => (
                <MessageRow
                  key={keyExtractor(item, idx)}
                  item={item}
                  avatarUri={avatarUri}
                />
              ))}
            </ScrollView>

            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#16a34a" />
                <Text style={styles.loadingText}>Generating your blog…</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyStateWrapper}>
            <View style={styles.imageContainer}>
              <Image
                source={require("@/assets/agent-img.png")}
                style={styles.image}
              />
            </View>

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
                disabled={!topic?.trim()}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff", padding: 5 },

  listContent: { paddingBottom: 24 },

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
  userText: { fontSize: 18, color: "#111827" },
  userAvatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    width: IMAGE_SIZE + 6,
    height: IMAGE_SIZE / 1.5,
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

  emptyStateWrapper: {
    flex: 1,
    position: "relative",
  },

  imageContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },

  inputBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },

  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 18,
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

// tagsStyles for react-native-render-html — keyed by HTML tag, since the
// server now generates HTML fragments directly (h2, p, ul/li, a, code, pre).
const htmlStyles = {
  body: { fontSize: 15, color: "#111827", lineHeight: 22 },
  p: { fontSize: 18, marginTop: 0, marginBottom: 10 },
  h1: { fontSize: 21, fontWeight: "700" as const, marginBottom: 8 },
  h2: {
    fontSize: 20,
    fontWeight: "700" as const,

    marginTop: 10,
    marginBottom: 6,
  },
  h3: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginTop: 8,
    marginBottom: 4,
  },
  a: {
    fontSize: 18,
    color: "#2563eb",
    textDecorationLine: "underline" as const,
  },
  code: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 4,
    borderRadius: 4,
    color: "#111827",
  },
  pre: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
    color: "#111827",
  },
  li: { marginBottom: 4 },
};
