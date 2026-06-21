import { router, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import axios from "axios";

const RootLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<true | false | null>(
    null,
  ); // null = loading

  const checkAuth = async () => {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsAuthenticated(true);
    } catch {
      await SecureStore.deleteItemAsync("token");
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
    if (isAuthenticated === true) {
      router.replace("/(tabs)");
    } else if (isAuthenticated === false) {
      router.replace("/(auth)");
    }
  }, [isAuthenticated]);
  return (
    <Stack
      screenOptions={{
        headerShown: false,

        animation: "none",
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
