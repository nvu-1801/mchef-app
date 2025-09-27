import React from "react";
import { View, Text, Image, Pressable, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function OnboardingScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
      {/* Hero image + fade */}
      <View style={styles.heroWrap}>
        <Image
          source={{
            uri:
              "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1600&auto=format&fit=crop",
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(255,255,255,0)", "#ffffff"]}
          style={styles.heroFade}
        />
      </View>

      {/* Content */}
      <View style={styles.body}>
        <Text style={styles.logo}>🍃</Text>
        <Text style={styles.title}>Cooking Guide</Text>
        <Text style={styles.subtitle}>
          Savor the Flavor, Master the Art. Discover delicious recipes with ease.
        </Text>

        <Link href="/(main)/home" asChild>
          <Pressable style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Get Started</Text>
          </Pressable>
        </Link>

        <Link href="/(auth)/sign-in" asChild>
          <Pressable style={styles.ghostBtn}>
            <Ionicons name="log-in-outline" size={18} />
            <Text style={styles.ghostText}>Sign In Here</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: "#fff" },

  heroWrap: {
    height: 260,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 140,
  },

  body: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  logo: {
    alignSelf: "center",
    fontSize: 40,
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 16,
  },

  primaryBtn: {
    backgroundColor: "#2E7D32", // xanh lá dịu
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },

  ghostBtn: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  ghostText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
});
