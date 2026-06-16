import { FontAwesome, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";

export default function Layout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#ffffff",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerTitle: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={30}
                color={focused ? "#ff5a00" : "#ff5a00"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create_blog"
          options={{
            headerTitle: "Create Blog",
            tabBarIcon: ({ color, focused }) => (
              <FontAwesome
                name={focused ? "plus-square" : "plus-square-o"}
                size={30}
                color={focused ? "#ff5a00" : "#ff5a00"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerTitle: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <FontAwesome5
                name={focused ? "user-alt" : "user"}
                size={28}
                color={focused ? "#ff5a00" : "#ff5a00"}
              />
            ),
          }}
        />
      </Tabs>
      <StatusBar style={"dark"} />
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
});
