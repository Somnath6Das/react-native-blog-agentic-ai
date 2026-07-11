import React, { useCallback } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { router } from "expo-router";
import { Blog } from "@/utils/get_public_blogs";
import { formatDateTime } from "@/store/format_datetime";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface Props {
  post: Blog;
}

export default function PostCard({ post }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const goToPost = useCallback(() => {
    router.push(`/post/${post.created_at}`);
  }, [post.created_at]);

  return (
    <AnimatedTouchable
      style={[styles.card, animatedStyle]}
      onPress={goToPost}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      activeOpacity={1}
    >
      <Image source={{ uri: post.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={12} color={COLORS.gray500} />
          <Text style={styles.metaText}>{formatDateTime(post.created_at)}</Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    ...SHADOWS.card,
  },
  image: {
    width: 90,
    height: 80,
    borderRadius: RADIUS.md,
    resizeMode: "cover",
  },
  info: {
    flex: 1,
    paddingLeft: SPACING.md,
    justifyContent: "center",
  },
  category: {
    ...FONTS.label,
    color: COLORS.primary,
    marginBottom: 4,
  },
  title: {
    ...FONTS.displayMD,
    fontSize: 15,
    color: COLORS.black,
    marginBottom: 6,
    lineHeight: 21,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
});
