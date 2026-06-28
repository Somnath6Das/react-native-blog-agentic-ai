import { View, Text } from "react-native";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { AntDesign } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

const DrawerLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerActiveTintColor: "blue",
          drawerHideStatusBarOnOpen: true,
          headerShadowVisible: false,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Create Blog",
            title: "Create Blog",

            drawerIcon: ({ color, size }) => (
              <AntDesign name="plus-circle" size={24} color="black" />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default DrawerLayout;
