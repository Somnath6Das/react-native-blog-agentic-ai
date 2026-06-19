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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = () => {
    router.push("/(auth)/signup");
  };
  const resetPassword = () => {
    router.push("/(auth)/reset_password");
  };

  const handleLogin = () => {
    // Wire up your email/password login logic here
    console.log("Login pressed", { email, password });
    router.push("/(tabs)");
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
            {/* ── Yellow Top Section ── */}
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

            {/* ── White Card ── */}
            <View style={styles.card}>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>

              {/* Email Input */}
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

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={TEXT_MUTED}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginBtn}
                activeOpacity={0.85}
                onPress={handleLogin}
              >
                <Text style={styles.loginBtnText}>Login</Text>
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={resetPassword}
                style={styles.forgotBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot your password?</Text>
              </TouchableOpacity>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.signUpBtn}
                activeOpacity={0.85}
                onPress={signUp}
              >
                <Text style={styles.signUpBtnText}>Sign Up</Text>
              </TouchableOpacity>

              {/* Footer links */}
              <View style={styles.footer}>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.footerLink}>Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.footerLink}>Terms of service</Text>
                </TouchableOpacity>
              </View>
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

  /* ── Yellow top ── */
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

  /* ── White card ── */
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
  },

  /* ── Inputs ── */
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

  /* ── Login button ── */
  loginBtn: {
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
  loginBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.5,
  },

  /* ── Forgot password ── */
  forgotBtn: {
    alignItems: "center",
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },

  /* ── Sign Up Button ── */
  signUpBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 24,
  },
  signUpBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
    textAlign: "center",
  },

  /* ── Footer ── */
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  footerLink: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
});
