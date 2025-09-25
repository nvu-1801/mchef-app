// import { Stack } from "expo-router";

// export default function MainLayout() {
//   return (
//     <Stack screenOptions={{ headerTitleAlign: "center" }}>
//       <Stack.Screen name="index" options={{ title: "Home" }} />
//       <Stack.Screen name="search" options={{ title: "Search" }} />
//       <Stack.Screen name="bookmarks" options={{ title: "Bookmarks" }} />
//       <Stack.Screen name="settings" options={{ title: "Settings" }} />
//       {/* Nếu có nested folders như chef/, recipe/ thì thêm screen khi cần */}
//     </Stack>
//   );
// }
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MainTabs() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2E7D32",    // xanh lá khi active
        tabBarInactiveTintColor: "#4B5563",  // xám khi inactive
        tabBarLabelStyle: { fontSize: 13, fontWeight: "700", marginTop: 0 },
        tabBarStyle: {
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#E5E7EB",
          elevation: 4, // shadow Android
        },
        tabBarIcon: ({ color, focused }) => {
          const name = (() => {
            switch (route.name) {
              case "index":     return focused ? "home" : "home-outline";
              case "favorites": return focused ? "bookmark" : "bookmark-outline";
              case "myrecipe":   return focused ? "school" : "school-outline";
              case "profile":   return focused ? "person" : "person-outline";
              default:          return "ellipse-outline";
            }
          })();
          return <Ionicons name={name as any} size={26} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="favorites" options={{ title: "Favorites" }} />
      <Tabs.Screen name="myrecipe" options={{ title: "My Recipe" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />

      {/*
        Nếu bạn có màn "search" trong (main) nhưng KHÔNG muốn hiển thị trên tab bar,
        khai báo để ẩn khỏi Tabs (vẫn điều hướng được bằng Link/router.push).
      */}
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}
