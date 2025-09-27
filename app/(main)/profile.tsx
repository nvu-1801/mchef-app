import React from "react";
import type { ComponentProps } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type BadgeIcon = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Badge = {
  id: string;
  label: string;
  icon: BadgeIcon;
};

const USER = {
  name: "Sophia Nguyen",
  title: "Plant-forward chef & content creator",
  avatar:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
  location: "Ho Chi Minh City, Vietnam",
  bio: "On a mission to make mindful eating easy and exciting. Sharing weekly meal prep guides, plant-forward twists, and the stories behind every dish.",
};

const STATS = [
  { id: "recipes", label: "Recipes", value: 48 },
  { id: "followers", label: "Followers", value: "12.4k" },
  { id: "saved", label: "Saved", value: 89 },
];

const BADGES: Badge[] = [
  { id: "seasonal", label: "Seasonal Expert", icon: "leaf" },
  { id: "spice", label: "Spice Master", icon: "leaf" },
  { id: "mentor", label: "Chef Mentor", icon: "account-heart" },
];

const RECENT_RECIPES = [
  {
    id: "rr-1",
    title: "Sesame Citrus Greens Bowl",
    time: "25 min",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop",
  },
  {
    id: "rr-2",
    title: "Charred Corn Coconut Soup",
    time: "35 min",
    image:
      "https://images.unsplash.com/photo-1432139509613-5c4255815697?w=800&h=600&fit=crop",
  },
  {
    id: "rr-3",
    title: "Miso Glazed Cauliflower Steak",
    time: "30 min",
    image:
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop",
  },
];

export default function Profile() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={22} color="#2d9cdb" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-outline" size={22} color="#2d9cdb" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <Image source={{ uri: USER.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{USER.name}</Text>
          <Text style={styles.title}>{USER.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#888" />
            <Text style={styles.locationText}>{USER.location}</Text>
          </View>
          <Text style={styles.bio}>{USER.bio}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]}>
              <Text style={styles.primaryBtnText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]}>
              <Text style={styles.secondaryBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsCard}>
          {STATS.map((stat, index) => (
            <View
              key={stat.id}
              style={[styles.statItem, index !== STATS.length - 1 && styles.statDivider]}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badge cabinet</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeRow}
          >
            {BADGES.map((badge) => (
              <View key={badge.id} style={styles.badgeCard}>
                <MaterialCommunityIcons name={badge.icon} size={26} color="#ff7a59" />
                <Text style={styles.badgeLabel}>{badge.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent recipes</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>See all</Text>
            </TouchableOpacity>
          </View>
          {RECENT_RECIPES.map((recipe) => (
            <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
              <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
              <View style={styles.recipeBody}>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <View style={styles.recipeMeta}>
                  <Ionicons name="time-outline" size={16} color="#999" />
                  <Text style={styles.recipeTime}>{recipe.time}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.bookmarkBtn}>
                <Ionicons name="bookmark-outline" size={22} color="#2d9cdb" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community</Text>
          </View>
          <View style={styles.communityCard}>
            <View style={styles.communityRow}>
              <Ionicons name="people-outline" size={22} color="#2ecc71" />
              <View style={styles.communityCopy}>
                <Text style={styles.communityTitle}>Weekend cook-along</Text>
                <Text style={styles.communitySubtitle}>
                  Join Sophia live this Saturday for a seasonal menu workshop.
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.communityBtn}>
              <Text style={styles.communityBtnText}>Reserve a spot</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f7fa" },
  container: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  iconBtn: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: "#e6f3fb",
    borderRadius: 12,
  },
  profileCard: {
    marginHorizontal: 18,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  name: { marginTop: 12, fontSize: 22, fontWeight: "700", color: "#2c2c2c" },
  title: { marginTop: 6, fontSize: 14, color: "#666", textAlign: "center" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  locationText: { marginLeft: 4, color: "#888" },
  bio: {
    marginTop: 12,
    color: "#525252",
    lineHeight: 20,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 18,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: "center",
  },
  primaryBtn: { backgroundColor: "#2d9cdb" },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
  secondaryBtn: { backgroundColor: "#f0f4f8" },
  secondaryBtnText: { color: "#2d9cdb", fontWeight: "600" },
  statsCard: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: "#e3e8ee",
  },
  statValue: { fontSize: 18, fontWeight: "700", color: "#2c2c2c" },
  statLabel: { marginTop: 4, color: "#888", fontSize: 12 },
  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#2c2c2c" },
  linkText: { color: "#2d9cdb", fontWeight: "600" },
  badgeRow: { paddingHorizontal: 18 },
  badgeCard: {
    width: 120,
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  badgeLabel: { marginTop: 8, color: "#555", fontWeight: "600", textAlign: "center" },
  recipeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 18,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  recipeImage: { width: 72, height: 72, borderRadius: 12, marginRight: 12 },
  recipeBody: { flex: 1 },
  recipeTitle: { fontSize: 15, fontWeight: "700", color: "#2c2c2c" },
  recipeMeta: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  recipeTime: { marginLeft: 6, color: "#888", fontSize: 12 },
  bookmarkBtn: { padding: 6 },
  communityCard: {
    marginHorizontal: 18,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  communityRow: { flexDirection: "row", alignItems: "center" },
  communityCopy: { marginLeft: 12, flex: 1 },
  communityTitle: { fontSize: 16, fontWeight: "700", color: "#2c2c2c" },
  communitySubtitle: { marginTop: 6, color: "#666", lineHeight: 18 },
  communityBtn: {
    marginTop: 18,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#2ecc71",
  },
  communityBtnText: { color: "#fff", fontWeight: "600" },
});
