import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Replace with your actual image source
const AVATAR_URI = "https://randomuser.me/api/portraits/men/32.jpg";

const TEAL = "#2BAE9C";
const WHITE = "#FFFFFF";
const TEXT_DARK = "#1A1A1A";
const TEXT_MUTED = "#7A7A7A";
const ICON_BG = "#FFF8E1";

const AVATAR_SIZE = 120;
const HEADER_HEIGHT = 140; // fixed header height
const AVATAR_OVERLAP = AVATAR_SIZE / 1.5; // how much avatar hangs below header

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      <View style={styles.root}>
        {/* ── Teal Header ── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
              <Text style={styles.settingsIcon}>⚙</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Grey Card ── */}
        <View style={styles.card}>
          {/* spacer so content sits below avatar */}
          <View style={styles.avatarSpacer} />
          <Text style={styles.name}>Lucas Bennett</Text>
          <Text style={styles.email}>lucasbennett@gmail.com</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Text style={styles.statEmoji}>⭐</Text>
              </View>
              <Text style={styles.statValue}>51</Text>
              <Text style={styles.statLabel}>Balance</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Text style={styles.statEmoji}>🏆</Text>
              </View>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
        </View>

        {/* ── Avatar — rendered LAST so it's on top of everything ── */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: AVATAR_URI }} style={styles.avatar} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: TEAL, // matches header so status bar area looks right
  },
  root: {
    flex: 1,
    backgroundColor: "#EBEBEB",
  },

  /* ── Header ── */
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: TEAL,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  backArrow: {
    fontSize: 26,
    color: TEXT_DARK,
    lineHeight: 30,
    fontWeight: "300",
    marginTop: -2,
  },
  settingsIcon: {
    fontSize: 20,
    color: TEXT_DARK,
  },

  /* ── Avatar — absolute, centered on the header/card boundary ── */
  avatarWrapper: {
    position: "absolute",
    top: HEADER_HEIGHT - AVATAR_OVERLAP, // straddles the boundary
    alignSelf: "center",
    left: "50%",
    marginLeft: -(AVATAR_SIZE / 2 + 4), // account for border width
    width: AVATAR_SIZE + 8, // +8 for 4px border each side
    height: AVATAR_SIZE + 8,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    borderWidth: 4,
    borderColor: WHITE,
    backgroundColor: WHITE,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10, // high elevation = on top
    zIndex: 10,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },

  /* ── Card ── */
  card: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
    // overlap the header slightly so there's no gap
    marginTop: -20,
  },
  // pushes name/email below the floating avatar
  avatarSpacer: {
    height: AVATAR_OVERLAP + 8,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_DARK,
    letterSpacing: 0.2,
  },
  email: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 4,
    marginBottom: 28,
  },

  /* ── Stats ── */
  statsRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  statCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  statEmoji: {
    fontSize: 22,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  statLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
});
