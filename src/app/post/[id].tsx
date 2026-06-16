import React, { useRef, useCallback, useState } from "react";
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
} from "react-native";
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
import { POSTS } from "../../data/posts";
import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from "../../constants/theme";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const HERO_HEIGHT = SCREEN_HEIGHT * 0.35;
const STATUS_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const post = POSTS.find((p) => p.id === id);

  const scrollY = useSharedValue(0);

  const [animKey, setAnimKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setAnimKey((k) => k + 1);
    }, []),
  );

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Hero parallax
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HERO_HEIGHT],
          [0, -HERO_HEIGHT / 2],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  // Nav bar fade in on scroll
  const navBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [0, 1], Extrapolation.CLAMP),
    backgroundColor: COLORS.white,
  }));

  // Always-visible back button bg (adapts from transparent to white)
  const backBgStyle = useAnimatedStyle(() => ({
    backgroundColor:
      interpolate(scrollY.value, [0, 80], [1, 0], Extrapolation.CLAMP) === 1
        ? "rgba(0,0,0,0.3)"
        : "transparent",
  }));

  if (!post) {
    return (
      <View style={styles.notFound}>
        <Text>Post not found</Text>
      </View>
    );
  }

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
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="bookmark-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Opaque navbar that fades in when scrolled */}
      <Animated.View
        style={[
          styles.opaqueNav,
          navBarStyle,
          { paddingTop: insets.top + STATUS_HEIGHT + 8 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {post.title}
        </Text>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </Animated.View>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Hero image with parallax */}
        <View style={styles.heroContainer}>
          <Animated.Image
            source={{ uri: post.imageUrl }}
            style={[styles.heroImage, heroStyle]}
          />
          <View style={styles.heroGradient} />
        </View>

        {/* Content card */}
        <View style={styles.contentCard}>
          {/* Category + title */}
          <Animated.View
            key={`cat-${animKey}`}
            entering={FadeInDown.duration(400).delay(100)}
          >
            <Text style={styles.category}>{post.category}</Text>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.location}>{post.location}</Text>
          </Animated.View>

          {/* Meta row */}
          <Animated.View
            key={`meta-${animKey}`}
            entering={FadeInDown.duration(400).delay(160)}
            style={styles.metaRow}
          >
            <Ionicons name="time-outline" size={13} color={COLORS.gray500} />
            <Text style={styles.metaText}>{post.timeAgo}</Text>
            <View style={styles.dot} />
            <Ionicons
              name="bookmark-outline"
              size={13}
              color={COLORS.gray500}
            />
            <Text style={styles.metaText}>{post.saves}</Text>
          </Animated.View>

          {/* Author */}
          <Animated.View
            key={`author-${animKey}`}
            entering={FadeInDown.duration(400).delay(200)}
            style={styles.authorRow}
          >
            <Image
              source={{ uri: post.author.avatarUrl }}
              style={styles.avatar}
            />
            <Text style={styles.authorName}>{post.author.name}</Text>
          </Animated.View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Body */}
          <Animated.View
            key={`body-${animKey}`}
            entering={FadeInDown.duration(500).delay(250)}
          >
            <Text style={styles.sectionHeading}>About location</Text>
            {post.body.split("\n\n").map((para, i) => (
              <Text key={i} style={styles.body}>
                {i === post.body.split("\n\n").length - 1 ? (
                  <>
                    {para.slice(0, -60)}
                    <Text style={styles.readMore}> Read More</Text>
                  </>
                ) : (
                  para
                )}
              </Text>
            ))}
          </Animated.View>
        </View>
      </AnimatedScrollView>
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
  // Hero
  heroContainer: {
    height: HERO_HEIGHT,
    overflow: "hidden",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT * 1.4,
    resizeMode: "cover",
    top: 0,
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
    // Bottom gradient via semi-transparent black
  },
  // Content
  contentCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -RADIUS.xl,
    padding: SPACING.lg,
    minHeight: SCREEN_HEIGHT * 0.6,
    ...SHADOWS.card,
  },
  category: {
    ...FONTS.label,
    color: COLORS.primary,
    marginBottom: 6,
  },
  title: {
    ...FONTS.displayXL,
    color: COLORS.black,
    marginBottom: 4,
  },
  location: {
    ...FONTS.bodyMD,
    color: COLORS.gray500,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: SPACING.md,
  },
  metaText: {
    ...FONTS.bodySM,
    color: COLORS.gray500,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gray300,
    marginHorizontal: 4,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorName: {
    ...FONTS.caption,
    color: COLORS.black,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginBottom: SPACING.md,
  },
  sectionHeading: {
    ...FONTS.displayMD,
    fontSize: 17,
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  body: {
    ...FONTS.bodyMD,
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  readMore: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});
