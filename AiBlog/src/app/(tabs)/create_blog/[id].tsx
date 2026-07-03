import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { useMenuStore } from "@/store/blog_store";
import BlogMain from "@/components/BlogMain";

const LocalBlogPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useMenuStore((s) =>
    s.menuItems.find((i) => i.id === Number(id)),
  );

  if (!item) return <Text>Not found</Text>;
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack.Screen options={{ title: item.title }} />
      <Text>{item.user_topic}</Text>

      <Text>{item.file_path}</Text>
      <Text>{item.images}</Text>
      {/* <BlogMain
        messages={messages}
        handleSend={handleSend}
        topic={topic}
        setTopic={setTopic}
        loading={loading}
        confirmed={confirmed}
        listRef={listRef}
      /> */}
    </View>
  );
};

export default LocalBlogPage;
