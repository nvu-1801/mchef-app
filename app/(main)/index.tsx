import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function MainScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Main Page</Text>
      <Link href="/(main)/search" asChild>
        <Button title="Go to Search" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
});
