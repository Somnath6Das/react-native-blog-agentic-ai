import React, { useRef, useCallback, useState, useEffect, use } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  Linking,
  ActivityIndicator,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeInDown,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, SPACING, SCREEN_HEIGHT } from "../../constants/theme";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const HERO_HEIGHT = SCREEN_HEIGHT * 0.35;
const STATUS_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;

export default function ShowAll() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Nav bar fade in on scroll
  const navBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [0, 1], Extrapolation.CLAMP),
    backgroundColor: COLORS.white,
  }));

  return (
    <View style={styles.root}>
      {/* Sticky back & bookmark buttons */}
      <View
        style={[
          styles.floatingNav,
          { paddingTop: insets.top + STATUS_HEIGHT + 8 },
        ]}
      >
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Opaque navbar that fades in when scrolled */}

      <View
        style={[
          styles.floatingNav,
          { paddingTop: insets.top + STATUS_HEIGHT + 8 },
        ]}
      >
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={{ fontSize: 20, fontWeight: "700" }}>
          All Blogs
        </Text>
        <View style={{ width: 38 }} />
      </View>
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      ></AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Floating nav (dark icons over image)
  floatingNav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Opaque navbar fades in on scroll
  opaqueNav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  navTitle: {
    ...FONTS.displayMD,
    fontSize: 15,
    color: COLORS.black,
    flex: 1,
    textAlign: "center",
    marginHorizontal: SPACING.sm,
  },
});
