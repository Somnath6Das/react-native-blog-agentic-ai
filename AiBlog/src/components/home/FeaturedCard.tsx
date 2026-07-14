import React, { useEffect, useRef, useCallback } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  SharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import {
  COLORS,
  FONTS,
  RADIUS,
  SHADOWS,
  SPACING,
  SCREEN_WIDTH,
} from "../../constants/theme";
import { Blog } from "@/utils/get_public_blogs";
import { router } from "expo-router";
import { BlurView } from "expo-blur";

const CARD_HEIGHT = SCREEN_WIDTH < 375 ? 220 : SCREEN_WIDTH < 428 ? 260 : 300;
const CARD_WIDTH = SCREEN_WIDTH - SPACING.md * 2;
const AUTO_PLAY_INTERVAL = 3500;
const SWIPE_THRESHOLD = CARD_WIDTH * 0.25;

interface Props {
  posts: Blog[];
}

// A cloned slide needs a distinct id for React keys, but keeps the same post data
type ExtendedSlide = Blog & { __cloneKey?: string };

export default function FeaturedCarousel({ posts }: Props) {
  const REAL_COUNT = Math.min(posts.length, 7);
  const realSlides = posts.slice(0, REAL_COUNT);

  // Build extended strip: [cloneOfLast, ...real, cloneOfFirst]
  const extendedSlides: ExtendedSlide[] = React.useMemo(() => {
    if (REAL_COUNT === 0) return [];
    if (REAL_COUNT === 1) return realSlides; // nothing to loop
    return [
      { ...realSlides[REAL_COUNT - 1], __cloneKey: "clone-last" },
      ...realSlides,
      { ...realSlides[0], __cloneKey: "clone-first" },
    ];
  }, [posts]);

  const EXTENDED_COUNT = extendedSlides.length;
  const canLoop = REAL_COUNT > 1;
  // Real slides live at extended indices [1 .. REAL_COUNT]; index 0 and
  // EXTENDED_COUNT-1 are the clones.
  const START_INDEX = canLoop ? 1 : 0;

  const currentIndex = useSharedValue(START_INDEX);
  const translateX = useSharedValue(-START_INDEX * CARD_WIDTH);
  const dragStart = useSharedValue(0);

  const [activeIndex, setActiveIndex] = React.useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toRealIndex = useCallback(
    (extIndex: number) => {
      if (!canLoop) return extIndex;
      return (((extIndex - 1) % REAL_COUNT) + REAL_COUNT) % REAL_COUNT;
    },
    [REAL_COUNT, canLoop],
  );

  const goTo = useCallback(
    (targetIndex: number, animated = true) => {
      currentIndex.value = targetIndex;
      const toValue = -targetIndex * CARD_WIDTH;

      if (animated) {
        translateX.value = withSpring(
          toValue,
          { damping: 20, stiffness: 200, mass: 0.8 },
          (finished) => {
            "worklet";
            if (!finished || !canLoop) return;
            // Landed on the trailing clone (of the first slide) -> snap to real first
            if (targetIndex === EXTENDED_COUNT - 1) {
              translateX.value = -1 * CARD_WIDTH;
              currentIndex.value = 1;
            }
            // Landed on the leading clone (of the last slide) -> snap to real last
            else if (targetIndex === 0) {
              translateX.value = -REAL_COUNT * CARD_WIDTH;
              currentIndex.value = REAL_COUNT;
            }
          },
        );
      } else {
        translateX.value = toValue;
      }

      setActiveIndex(toRealIndex(targetIndex));
    },
    [EXTENDED_COUNT, REAL_COUNT, canLoop, toRealIndex],
  );

  const startAutoPlay = useCallback(() => {
    if (!canLoop) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goTo(currentIndex.value + 1);
    }, AUTO_PLAY_INTERVAL);
  }, [goTo, canLoop]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      dragStart.value = translateX.value;
      scheduleOnRN(stopAutoPlay);
    })
    .onUpdate((e) => {
      translateX.value = dragStart.value + e.translationX;
    })
    .onEnd((e) => {
      const velocity = e.velocityX;
      const translation = e.translationX;
      let nextIndex = currentIndex.value;

      if (translation < -SWIPE_THRESHOLD || velocity < -500) {
        nextIndex = currentIndex.value + 1;
      } else if (translation > SWIPE_THRESHOLD || velocity > 500) {
        nextIndex = currentIndex.value - 1;
      }

      scheduleOnRN(goTo, nextIndex);
      scheduleOnRN(startAutoPlay);
    })
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15]);

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const goToPost = useCallback((post: Blog) => {
    router.push(`/post/${post.id}`);
  }, []);

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.clipper}>
          <Animated.View style={[styles.strip, stripStyle]}>
            {extendedSlides.map((post, i) => (
              <SlideItem
                key={post.__cloneKey ?? post.id}
                post={post}
                index={i}
                currentIndex={currentIndex}
                onPress={() => goToPost(post)}
              />
            ))}
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={styles.dots}>
        {realSlides.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              goTo(i + (canLoop ? 1 : 0));
              startAutoPlay();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <DotIndicator index={i} activeIndex={activeIndex} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function SlideItem({
  post,
  index,
  currentIndex,
  onPress,
}: {
  post: Blog;
  index: number;
  currentIndex: SharedValue<number>;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const diff = Math.abs(index - currentIndex.value);
    const scale = interpolate(diff, [0, 1], [1, 0.96], Extrapolation.CLAMP);
    const opacity = interpolate(diff, [0, 1], [1, 0.7], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View style={[styles.slide, animatedStyle]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.92}
      >
        <Image source={{ uri: post.image }} style={styles.image} />

        <BlurView intensity={35} tint="dark" style={styles.blurContainer}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {post.title}
          </Text>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

function DotIndicator({
  index,
  activeIndex,
}: {
  index: number;
  activeIndex: number;
}) {
  const isActive = index === activeIndex;
  return (
    <Animated.View
      style={[styles.dot, isActive ? styles.dotActive : styles.dotInactive]}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", marginBottom: SPACING.lg },
  clipper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: "hidden",
    borderRadius: RADIUS.lg,
    ...SHADOWS.strong,
  },
  strip: { flexDirection: "row", width: CARD_WIDTH * 100, height: CARD_HEIGHT },
  slide: { width: CARD_WIDTH, height: CARD_HEIGHT },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
    resizeMode: "cover",
  },
  overlayTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  overlayBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "32%",
    backgroundColor: "rgba(0,0,0,0.52)",
  },
  blurContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "flex-end",
    overflow: "hidden",
    // if BlurView's own background isn't tinted enough on Android,
    // this rgba layer gives a consistent look across platforms
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  title: {
    ...FONTS.displayLG,
    color: COLORS.white,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: { ...FONTS.bodyMD, color: "rgba(255,255,255,0.85)", marginTop: 3 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: SPACING.sm,
  },
  dot: { height: 7, borderRadius: 4 },
  dotActive: { width: 22, backgroundColor: COLORS.primary },
  dotInactive: { width: 7, backgroundColor: COLORS.gray300 },
});
