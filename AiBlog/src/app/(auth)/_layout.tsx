import { Redirect, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default Layout;
