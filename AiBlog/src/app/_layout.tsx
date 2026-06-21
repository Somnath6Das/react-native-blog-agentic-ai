import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import axios from "axios";

const RootLayout = () => {
  // const checkAuth = async () => {
  //   const token = await SecureStore.getItemAsync("token");

  //   if (!token) return false;

  //   try {
  //     await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/me`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     return true;
  //   } catch {
  //     await SecureStore.deleteItemAsync("token");
  //     return false;
  //   }
  // };
  // useEffect(() => {
  //   checkAuth();
  // }, []);
  return (
    <Stack
      screenOptions={{
        headerShown: false,

        animation: "slide_from_right",
        animationDuration: 320,
        contentStyle: { backgroundColor: "#fff" },
        gestureEnabled: true,
        gestureDirection: "horizontal",
        // Custom transition: fade + slide
        // customAnimationOnGesture: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen
        name="post/[id]"
        options={{
          animation: "slide_from_right",
          animationDuration: 350,
        }}
      />
    </Stack>
  );
};

export default RootLayout;
