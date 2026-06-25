import {
  Alert,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import useAuthStore from "@/store/auth_store";
import * as ImagePicker from "expo-image-picker";
import { handleResult } from "@/utils/image_upload";
import { useState } from "react";
import {
  AntDesign,
  EvilIcons,
  Feather,
  Ionicons,
  SimpleLineIcons,
} from "@expo/vector-icons";

// Replace with your actual image source
const AVATAR_URI = "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";

const WHITE = "#FFFFFF";
const TEXT_DARK = "#1A1A1A";
const TEXT_MUTED = "#7A7A7A";
const ICON_BG = "#FFF8E1";
const YELLOW = "#F5C518";
const ORANGE = "#F0A500";
const AVATAR_SIZE = 120;
const HEADER_HEIGHT = 140; // fixed header height
const AVATAR_OVERLAP = AVATAR_SIZE / 1.5; // how much avatar hangs below header

export default function ProfileScreen() {
  const { user, clearAuth } = useAuthStore();
  const [image, setImage] = useState<string | undefined>("");
  // const [remoteImage, setRemoteImage] = useState<string | null>(null);
  const [openImageModal, setOpenImageModal] = useState(false);

  const [cameraPermission, requestCameraPermission] =
    ImagePicker.useCameraPermissions();
  const [libraryPermission, requestLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const handleSignout = async () => {
    await SecureStore.deleteItemAsync("token");
    clearAuth();
    console.log("Clear Auth from store");
    router.push("/(auth)");
  };

  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  };
  const pickFromCamera = async () => {
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) {
        Alert.alert("Permission needed", "Please allow access to your camera.");
        return;
      }
    }
    const result = await ImagePicker.launchCameraAsync(pickerOptions);
    if (result.canceled) return;
    setImage(result?.assets[0]?.uri);
    handleResult(result?.assets[0]?.uri);
    setOpenImageModal(false);
  };
  const pickFromGallery = async () => {
    if (!libraryPermission?.granted) {
      const res = await requestLibraryPermission();
      if (!res.granted) {
        Alert.alert("Permission needed", "Please allow access to your photos.");
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    if (result.canceled) return;
    setImage(result?.assets[0]?.uri);
    handleResult(result?.assets[0]?.uri);
    setOpenImageModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Modal
        visible={openImageModal}
        statusBarTranslucent={true}
        transparent={true}
        // animationType="slide"
      >
        <View style={styles.content}>
          <View style={styles.modelCard}>
            <Text style={styles.modelTitle}>Select Image Source</Text>
            <View style={styles.modelDesc}>
              <TouchableOpacity onPress={pickFromCamera}>
                <AntDesign name="camera" size={55} color="#494949" />
              </TouchableOpacity>
              <TouchableOpacity onPress={pickFromGallery}>
                <Feather name="folder" size={53} color="#494949" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{ alignItems: "center", marginTop: 24 }}
              onPress={() => setOpenImageModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: "#3387f6" }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <StatusBar barStyle="light-content" backgroundColor={ORANGE} />

      <View style={styles.root}>
        {/* ── Teal Header ── */}
        <View style={styles.header}>
          <View style={styles.headerRow}></View>
        </View>

        {/* ── Grey Card ── */}
        <View style={styles.card}>
          {/* spacer so content sits below avatar */}
          <View style={styles.avatarSpacer} />
          <Text style={styles.name}>Lucas Bennett</Text>
          <Text style={styles.email}>{user?.email}</Text>

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
          <TouchableOpacity onPress={() => setOpenImageModal(true)}>
            <Image
              source={{
                uri: image || user?.avatar_url || AVATAR_URI,
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.signoutBtn}
          activeOpacity={0.85}
          onPress={handleSignout}
        >
          <Text style={styles.signoutBtnText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: YELLOW, // matches header so status bar area looks right
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modelCard: {
    width: "70%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 8,
  },
  modelTitle: {
    alignSelf: "center",
    fontWeight: "bold",
    color: "#494949",
    fontSize: 18,
    marginBottom: 12,
  },
  modelDesc: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 8,
    padding: 6,
  },
  modelCloseButton: {
    width: "90%",
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    borderRadius: 8,
  },
  closeButtonText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  root: {
    flex: 1,
    backgroundColor: "#EBEBEB",
  },

  /* ── Header ── */
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: YELLOW,
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

  signoutBtn: {
    backgroundColor: "#c6c6c6",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 16,
    margin: 10,
    elevation: 4,
  },
  signoutBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "black",
    letterSpacing: 0.5,
  },
});
