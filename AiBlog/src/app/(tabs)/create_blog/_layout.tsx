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
import { useMenuStore } from "@/store/blog_store";

function CustomDrawerComponent(props: DrawerContentComponentProps) {
  // const menuItems = [
  //   { id: 42, title: "Item 42" },
  //   { id: 43, title: "Item 43" },
  //   { id: 44, title: "Item 44" },
  // ];

  const menuItems = useMenuStore((s) => s.menuItems);
  const reversedItems = [...menuItems].reverse();
  const pathName = usePathname();

  return (
    <DrawerContentScrollView {...props}>
      <View
        style={{
          alignItems: "flex-start",
          paddingVertical: 20,
          marginLeft: 15,
        }}
      >
        <Text style={{ fontSize: 26 }}>Blog Writing Agent</Text>
      </View>

      <DrawerItemList {...props} />
      <View style={{ padding: 16, paddingTop: 25 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Your Previous Blogs
        </Text>
      </View>
      {reversedItems.map((item) => {
        const isActive = pathName === `/create_blog/${item.id}`;
        return (
          <DrawerItem
            key={item.id}
            focused={isActive}
            activeTintColor="blue"
            inactiveTintColor="black"
            label={item.title}
            labelStyle={{ fontSize: 18 }}
            onPress={() =>
              router.push({
                pathname: "/create_blog/[id]",
                params: { id: String(item.id) },
              })
            }
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
            drawerItemStyle: {
              marginHorizontal: 12,
              alignSelf: "flex-start",
              width: 200,
              borderRadius: 24,
              paddingHorizontal: 4,
            },
            drawerLabelStyle: {
              fontSize: 15,
              alignSelf: "center",
              fontWeight: "600",
              marginLeft: -8,
            },
            drawerIcon: ({ color, size }) => (
              <AntDesign name="plus-circle" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="[id]"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default DrawerLayout;
