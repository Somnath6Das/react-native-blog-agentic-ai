import { View, Text } from "react-native";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Drawer,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "expo-router/drawer";
import { AntDesign } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

function CustomDrawerComponent(props: DrawerContentComponentProps) {
  const menuItems = [
    {
      id: 42,
      title: "Item 42",
    },
    {
      id: 43,
      title: "Item 43",
    },
    {
      id: 44,
      title: "Item 44",
    },
  ];
  const pathName = usePathname();
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={{ padding: 16, paddingTop: 40 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          Your Previous Blogs
        </Text>
      </View>
      {menuItems.map((item) => {
        const IsActive = pathName === `/create_blog/${item.id}`;
        return (
          <DrawerItem
            focused={IsActive}
            key={item.id}
            label={item.title}
            onPress={() => router.push(`/create_blog/${item.id}`)}
          />
        );
      })}
    </DrawerContentScrollView>
  );
}

const DrawerLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={CustomDrawerComponent}
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
        <Drawer.Screen
          name="[id]"
          options={{
            drawerItemStyle: {
              display: "none",
            },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default DrawerLayout;
