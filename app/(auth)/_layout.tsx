// app/(auth)/_layout.tsx
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { bootstrapAuthListener } from "../../src/auth/bootstrapAuth";

export default function AuthLayout() {
  useEffect(() => {
    const off = bootstrapAuthListener();
    return () => off?.();
  }, []);

  return (
    <Stack screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false  }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="onboard" options={{ headerShown: false  }} />
    </Stack>
  );
}
