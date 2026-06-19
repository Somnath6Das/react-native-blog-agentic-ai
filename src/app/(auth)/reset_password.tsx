import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const YELLOW = "#F5C518";
const ORANGE = "#F0A500";
const WHITE = "#FFFFFF";
const TEXT_DARK = "#1A1A1A";
const TEXT_MUTED = "#AAAAAA";

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");

  const goToLogin = () => {
    router.push("/(auth)");
  };

  const handleReset = () => {
    console.log("Reset password pressed", { email });
    router.push("/(auth)");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={YELLOW} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.root}>
            <View style={styles.topSection}>
              <View style={styles.orangeBlob} />

              <View style={styles.logoContainer}>
                <View style={styles.smileOuter}>
                  <View style={styles.smileInner} />
                </View>
                <View style={styles.barsRow}>
                  <View style={[styles.bar, { height: 18 }]} />
                  <View style={[styles.bar, { height: 26 }]} />
                  <View style={[styles.bar, { height: 22 }]} />
                  <View style={[styles.bar, { height: 30 }]} />
                  <View style={[styles.bar, { height: 16 }]} />
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a link to reset your
                password
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="johndoe@example.com"
                  placeholderTextColor={TEXT_MUTED}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.85}
                onPress={handleReset}
              >
                <Text style={styles.primaryBtnText}>Send Reset Link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={goToLogin}
                style={styles.secondaryBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryText}>
                  Remember your password?{" "}
                  <Text style={styles.secondaryLink}>Back to Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: YELLOW,
  },
  root: {
    flex: 1,
    backgroundColor: WHITE,
  },

  topSection: {
    backgroundColor: YELLOW,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  orangeBlob: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: ORANGE,
    top: 40,
    right: "20%",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 2,
  },
  smileOuter: {
    width: 52,
    height: 28,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    backgroundColor: WHITE,
    overflow: "hidden",
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  smileInner: {
    width: 36,
    height: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: YELLOW,
    marginTop: 4,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
  },
  bar: {
    width: 10,
    backgroundColor: WHITE,
    borderRadius: 3,
  },

  card: {
    flex: 1,
    backgroundColor: WHITE,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 24,
    marginTop: -28,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 32,
    lineHeight: 20,
  },

  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  input: {
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: TEXT_DARK,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  primaryBtn: {
    backgroundColor: YELLOW,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
    shadowColor: ORANGE,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.5,
  },

  secondaryBtn: {
    alignItems: "center",
    marginBottom: 24,
  },
  secondaryText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  secondaryLink: {
    color: TEXT_DARK,
    fontWeight: "700",
  },
});
