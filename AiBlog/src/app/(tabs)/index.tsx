import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
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

export default function HomeScreen() {
  const router = useRouter();
  const [animKey, setAnimKey] = useState(0);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setAnimKey((k) => k + 1);
    }, []),
  );

  const fetchBlogs = async () => {
    try {
      const data = await getPublicBlogs();
      // console.log(data);
      setBlogs(data);
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

  // runs once, on first mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchBlogs();
      setLoading(false);
    })();
  }, []);

  // runs only when user pulls to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBlogs();
    setRefreshing(false);
  }, []);

  const goToPost = useCallback(
    (post: Post) => {
      router.push(`/post/${post.id}`);
    },
    [router],
  );

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
          key={`header-${animKey}`}
          entering={FadeInDown.duration(400).delay(50)}
          style={styles.header}
        >
          <Text style={styles.brand}>OUTDOOR</Text>
        </Animated.View>

        {/* Journal heading */}
        <Animated.Text
          key={`journal-${animKey}`}
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.sectionTitle}
        >
          Journal
        </Animated.Text>

        {/* Carousel — all posts */}
        <Animated.View
          key={`carousel-${animKey}`}
          entering={FadeInDown.duration(500).delay(150)}
        >
          <FeaturedCarousel posts={POSTS} onPress={goToPost} />
        </Animated.View>

        {/* Popular header */}
        <Animated.View
          key={`popular-${animKey}`}
          entering={FadeInDown.duration(400).delay(220)}
          style={styles.popularHeader}
        >
          <Text style={styles.sectionTitle}>Popular</Text>
          <TouchableOpacity>
            <Text style={styles.showAll}>Show all</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Popular list */}
        {popular.map((post, idx) => (
          <Animated.View
            key={`${post.id}-${animKey}`}
            entering={FadeInDown.duration(400).delay(280 + idx * 80)}
          >
            <PostCard post={post} onPress={() => goToPost(post)} />
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
