import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  useAnimatedReaction,
  cancelAnimation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING, SCREEN_WIDTH } from '../constants/theme';
import type { Post } from '../data/posts';

const CARD_HEIGHT = SCREEN_WIDTH < 375 ? 220 : SCREEN_WIDTH < 428 ? 260 : 300;
const CARD_WIDTH = SCREEN_WIDTH - SPACING.md * 2;
const AUTO_PLAY_INTERVAL = 3500;
const SWIPE_THRESHOLD = CARD_WIDTH * 0.25;

interface Props {
  posts: Post[];
  onPress: (post: Post) => void;
}

export default function FeaturedCarousel({ posts, onPress }: Props) {
  const count = posts.length;
  // We use a virtual infinite list: offset = currentIndex * CARD_WIDTH
  const currentIndex = useSharedValue(0);
  const translateX = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Active dot index (JS side) for rendering
  const [activeIndex, setActiveIndex] = React.useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number, animated = true) => {
    const clamped = ((index % count) + count) % count;
    currentIndex.value = clamped;
    translateX.value = animated
      ? withSpring(-clamped * CARD_WIDTH, {
          damping: 20,
          stiffness: 200,
          mass: 0.8,
        })
      : -clamped * CARD_WIDTH;
    setActiveIndex(clamped);
  }, [count]);

  // Auto-play
  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const next = (currentIndex.value + 1) % count;
      goTo(next);
    }, AUTO_PLAY_INTERVAL);
  }, [count, goTo]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
      dragStart.value = translateX.value;
      runOnJS(stopAutoPlay)();
    })
    .onUpdate((e) => {
      // Allow rubber-banding at edges
      translateX.value = dragStart.value + e.translationX;
    })
    .onEnd((e) => {
      isDragging.value = false;
      const velocity = e.velocityX;
      const translation = e.translationX;
      let nextIndex = currentIndex.value;

      if (translation < -SWIPE_THRESHOLD || velocity < -500) {
        nextIndex = (currentIndex.value + 1) % count;
      } else if (translation > SWIPE_THRESHOLD || velocity > 500) {
        nextIndex = (currentIndex.value - 1 + count) % count;
      }

      runOnJS(goTo)(nextIndex);
      runOnJS(startAutoPlay)();
    })
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15]);

  // Animated slide strip style
  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.clipper}>
          <Animated.View style={[styles.strip, stripStyle]}>
            {posts.map((post, i) => (
              <SlideItem
                key={post.id}
                post={post}
                index={i}
                currentIndex={currentIndex}
                count={count}
                onPress={() => onPress(post)}
              />
            ))}
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {posts.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => { goTo(i); startAutoPlay(); }}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <DotIndicator index={i} activeIndex={activeIndex} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Individual slide
function SlideItem({
  post,
  index,
  currentIndex,
  count,
  onPress,
}: {
  post: Post;
  index: number;
  currentIndex: Animated.SharedValue<number>;
  count: number;
  onPress: () => void;
}) {
  // Subtle scale + opacity for the active slide
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
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
        {/* Gradient overlay layers */}
        <View style={styles.overlayTop} />
        <View style={styles.overlayBottom} />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
          {post.subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>{post.subtitle}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Animated dot
function DotIndicator({ index, activeIndex }: { index: number; activeIndex: number }) {
  const isActive = index === activeIndex;
  return (
    <Animated.View
      style={[
        styles.dot,
        isActive ? styles.dotActive : styles.dotInactive,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  clipper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
    borderRadius: RADIUS.lg,
    ...SHADOWS.strong,
  },
  strip: {
    flexDirection: 'row',
    width: CARD_WIDTH * 100, // large enough
    height: CARD_HEIGHT,
  },
  slide: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  content: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
  },
  title: {
    ...FONTS.displayLG,
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...FONTS.bodyMD,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
  },
  // Dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 7,
    backgroundColor: COLORS.gray300,
  },
});
