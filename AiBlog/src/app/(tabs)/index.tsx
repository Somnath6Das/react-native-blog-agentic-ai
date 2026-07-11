import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";

import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import FeaturedCarousel from "@/components/home/FeaturedCard";
import PostCard from "@/components/home/PostCard";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import type { Post } from "@/data/posts";
import { POSTS } from "@/data/posts";
import { Blog, getPublicBlogs } from "@/utils/get_public_blogs";
import axios from "axios";

const popular = POSTS.filter((p) => !p.featured);

// Module-level flag: survives component unmount/remount, only resets
// when the JS runtime restarts (i.e. a real fresh app launch/reload).
let hasPlayedIntroAnimation = false;

export default function HomeScreen() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Decide once, on first mount of this instance, whether to animate.
  const [shouldAnimate] = useState(() => {
    if (hasPlayedIntroAnimation) return false;
    hasPlayedIntroAnimation = true;
    return true;
  });

  const fetchBlogs = async () => {
    try {
      const data = await getPublicBlogs();
      setBlogs(data);
      // console.log(data);
      setError(null);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.detail ?? "Failed to load blogs")
          : "Something went wrong",
      );
      console.error(err);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchBlogs();
      setLoading(false);
    })();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBlogs();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Animated.View
          entering={
            shouldAnimate ? FadeInDown.duration(400).delay(50) : undefined
          }
          style={styles.header}
        >
          <Text style={styles.brand}>OUTDOOR</Text>
        </Animated.View>

        {/* Journal heading */}
        <Animated.Text
          entering={
            shouldAnimate ? FadeInDown.duration(400).delay(100) : undefined
          }
          style={styles.sectionTitle}
        >
          Journal
        </Animated.Text>

        {/* Carousel — all posts */}
        <Animated.View
          entering={
            shouldAnimate ? FadeInDown.duration(500).delay(150) : undefined
          }
        >
          <FeaturedCarousel posts={blogs} />
        </Animated.View>

        {/* Popular header */}
        <Animated.View
          entering={
            shouldAnimate ? FadeInDown.duration(400).delay(220) : undefined
          }
          style={styles.popularHeader}
        >
          <Text style={styles.sectionTitle}>Popular</Text>
          <TouchableOpacity>
            <Text style={styles.showAll}>Show all</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Popular list */}
        {blogs.slice(0, 3).map((post, idx) => (
          <Animated.View
            key={post.created_at}
            entering={
              shouldAnimate
                ? FadeInDown.duration(400).delay(280 + idx * 80)
                : undefined
            }
          >
            <PostCard post={post} />
          </Animated.View>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  brand: {
    flex: 1,
    ...FONTS.displayMD,
    fontSize: 20,
    color: COLORS.primary,
    justifyContent: "center",
    textAlign: "center",
    letterSpacing: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#C4C4C4",
  },
  scroll: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  sectionTitle: {
    ...FONTS.displayLG,
    color: "#1A1A1A",
    marginBottom: SPACING.md,
  },
  popularHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  showAll: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.primary,
  },
  bottomSpacer: {
    height: SPACING.lg,
  },
});
