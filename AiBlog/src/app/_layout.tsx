import { Stack } from "expo-router";

const RootLayout = () => {
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
