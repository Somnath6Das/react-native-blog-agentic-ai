import { router, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import api from "@/utils/api";

const RootLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuth = async () => {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      await api.get("/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAuthenticated(true);
    } catch (error: any) {
      // Token is invalid/expired — clear it
      await SecureStore.deleteItemAsync("token");
      setIsAuthenticated(false);
    }
  };
  useEffect(() => {
    const run = async () => {
      await checkAuth(); // wait for it to finish
      // navigation is now handled by the state change re-triggering this effect
    };
    run();
  }, []);

  useEffect(() => {
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
      <Stack.Screen name="(tabs)" />
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
