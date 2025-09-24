import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function SignUp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Pressable style={styles.btn} onPress={() => router.replace("/(main)")}>
        <Text style={{ color: "white", fontWeight: "700" }}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: "800" },
  btn: { backgroundColor: "#2E7D32", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
});
