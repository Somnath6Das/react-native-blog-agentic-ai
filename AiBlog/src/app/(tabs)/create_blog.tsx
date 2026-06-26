import { COLORS } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// ── Types ──────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

// ── Seed data matching the screenshot ─────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  { id: "1", role: "user", text: "What is Pancasila?" },
  {
    id: "2",
    role: "assistant",
    text: "Pancasila is the official philosophical foundation of the Indonesian state. It consists of five principles: (1) belief in one God, (2) just and civilized humanity, (3) the unity of Indonesia, (4) democracy guided by the inner wisdom in the unanimity arising out of deliberations among representatives, and (5) social justice for all Indonesians.",
  },
];

// ── Avatar: GPT circle ─────────────────────────────────────────────────────
const GPTAvatar = () => (
  <View style={styles.gptAvatar}>
    {/* Simple "G" mark as a stand-in for the OpenAI logo */}
    <Text style={styles.gptAvatarText}>✦</Text>
  </View>
);

// ── Avatar: User initial ───────────────────────────────────────────────────
const UserAvatar = () => (
  <View style={styles.userAvatar}>
    <Text style={styles.userAvatarText}>U</Text>
  </View>
);

// ── Single message bubble ──────────────────────────────────────────────────
const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.text}</Text>
        </View>
        <UserAvatar />
      </View>
    );
  }

  return (
    <View style={styles.assistantRow}>
      <GPTAvatar />
      <View style={styles.assistantBubble}>
        <Text style={styles.assistantText}>{message.text}</Text>
      </View>
    </View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("I'd love to know more");
  const listRef = useRef<FlatList>(null);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate a reply after a short delay
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "That's a great question! Feel free to ask anything else about Pancasila or Indonesian history.",
      };
      setMessages((prev) => [...prev, reply]);
      listRef.current?.scrollToEnd({ animated: true });
    }, 800);

    listRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="menu" size={26} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write Your Blog Topic</Text>
      </View>

      {/* ── Message list ───────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <MessageBubble message={item} />}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* ── Input bar ──────────────────────────────────────────────── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Message ChatGPT"
            placeholderTextColor="#AAAAAA"
            multiline
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !input.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send-sharp"
              size={22}
              color="white"
              style={{ paddingLeft: 3 }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    height: 52,
    backgroundColor: "#FFFFFF",
    alignItems: "flex-start",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    alignSelf: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: -0.2,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 20,
  },

  // User row
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    gap: 8,
  },
  userBubble: {
    backgroundColor: "#F0F0F0",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: "75%",
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1A1A1A",
  },

  // Assistant row
  assistantRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  assistantBubble: {
    flex: 1,
    paddingTop: 4,
  },
  assistantText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#1A1A1A",
  },

  // GPT avatar
  gptAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#10A37F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  gptAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  // User avatar
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6B4EFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  userAvatarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: "#F7F7F7",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 15,
    color: "#1A1A1A",
    lineHeight: 21,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10A37F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#C8C8C8",
  },
  sendIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: -1,
  },
});
