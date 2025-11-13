// components/GoogleSignInButton.tsx
import React from "react";
import { Pressable, Text, Image, View, Platform } from "react-native";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  label?: string; // mặc định: "Sign in with Google"
};

export default function GoogleSignInButton({ onPress, disabled, label = "Sign in with Google" }: Props) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#e9ecef" }}
      disabled={disabled}
      style={({ pressed }) => [
        {
          height: 40,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "#DADCE0",
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 12,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 10,
          opacity: disabled ? 0.6 : 1,
          ...(Platform.OS === "ios" && pressed ? { opacity: 0.7 } : null),
        },
      ]}
    >
      <View
        style={{
          width: 18,
          height: 18,
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 2, // căn nhẹ giống spec
        }}
      >
        <Image
          source={require("../assets/google_g.png")} // CẬP NHẬT đường dẫn nếu khác
          style={{ width: 18, height: 18, resizeMode: "contain" }}
        />
      </View>
      <Text
        style={{
          color: "#3C4043",
          fontSize: 14,
          fontWeight: "500", // Roboto Medium tương đương
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
