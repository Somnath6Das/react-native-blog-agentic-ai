import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Blog } from "@/utils/get_public_blogs";

const NUM_COLUMNS = 2;
const OUTER_PADDING = 16; // matches the FlatList's contentContainerStyle padding
const COLUMN_GAP = 16; // matches columnWrapperStyle gap in the parent list

const CARD_WIDTH =
  (Dimensions.get("window").width -
    OUTER_PADDING * 2 -
    COLUMN_GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;
const CARD_HEIGHT = 170;

export const BlogCard = ({ post }: { post: Blog }) => {
  const handlePress = () => {
    router.push(`/post/${post.id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.cardWrapper}
    >
      <ImageBackground
        source={{ uri: post.image }}
        style={styles.image}
        imageStyle={styles.imageRadius}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.85)"]}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        >
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {post.title}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

// Render this inside a FlatList with numColumns={2} and
// columnWrapperStyle={{ gap: COLUMN_GAP }} as your DB-driven grid

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    // subtle elevation to lift the card off the screen
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  imageRadius: {
    borderRadius: 16,
  },
  gradient: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "flex-end",
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 19,
  },
});

export default BlogCard;
