import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import type { ComponentProps } from "react";
import { Ionicons, Feather } from "@expo/vector-icons";

type IconName = ComponentProps<typeof Ionicons>["name"];

type FeatherIconName = ComponentProps<typeof Feather>["name"];

type RecipeItem = {
  id: string;
  title: string;
  summary: string;
  updatedAt: string;
  cover: string;
  stats: {
    saves: number;
    views: number;
  };
};

const STATS = [
  {
    id: "published",
    label: "Published",
    value: 24,
    trend: "+6 this month",
    icon: "checkmark-circle-outline" as IconName,
    iconColor: "#2ecc71",
  },
  {
    id: "drafts",
    label: "Drafts",
    value: 5,
    trend: "2 need photos",
    icon: "document-text-outline" as IconName,
    iconColor: "#f7b500",
  },
  {
    id: "favorites",
    label: "Saved",
    value: 312,
    trend: "+18 this week",
    icon: "bookmark-outline" as IconName,
    iconColor: "#2d9cdb",
  },
];

const QUICK_ACTIONS: { id: string; label: string; icon: FeatherIconName }[] = [
  { id: "action-1", label: "New recipe", icon: "plus" },
  { id: "action-2", label: "Import draft", icon: "upload" },
  { id: "action-3", label: "Plan menu", icon: "calendar" },
];

const DRAFTS: RecipeItem[] = [
  {
    id: "draft-1",
    title: "Lemongrass Ginger Broth",
    summary: "Slow-simmered broth with roasted aromatics and shiitake",
    updatedAt: "Edited 2h ago",
    cover:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=900&h=700&fit=crop",
    stats: { saves: 0, views: 18 },
  },
  {
    id: "draft-2",
    title: "Coconut Lime Overnight Oats",
    summary: "Make-ahead breakfast with toasted coconut crunch",
    updatedAt: "Edited yesterday",
    cover:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&h=700&fit=crop",
    stats: { saves: 10, views: 64 },
  },
];

const PUBLISHED: RecipeItem[] = [
  {
    id: "pub-1",
    title: "Smoky Charred Eggplant Dip",
    summary: "Silky eggplant folded with tahini, herbs, and confit garlic",
    updatedAt: "Published 3 days ago",
    cover:
      "https://images.unsplash.com/photo-1514516430032-7f40ed986176?w=900&h=700&fit=crop",
    stats: { saves: 210, views: 1852 },
  },
  {
    id: "pub-2",
    title: "Crispy Sesame Tofu Bao",
    summary: "Steamed bao with tamari glaze, pickled daikon, and herbs",
    updatedAt: "Published 1 week ago",
    cover:
      "https://images.unsplash.com/photo-1484981137413-2e678c29d50d?w=900&h=700&fit=crop",
    stats: { saves: 142, views: 1326 },
  },
  {
    id: "pub-3",
    title: "Golden Turmeric Latte Mix",
    summary: "Spice blend for cozy evenings, ready in 3 minutes",
    updatedAt: "Published 2 weeks ago",
    cover:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&h=700&fit=crop",
    stats: { saves: 88, views: 904 },
  },
];

export default function MyRecipeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Creator hub</Text>
            <Text style={styles.headerTitle}>My recipes</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="settings" size={18} color="#2d9cdb" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statRow}
        >
          {STATS.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: `${stat.iconColor}15` }] }>
                <Ionicons name={stat.icon} size={20} color={stat.iconColor} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statTrend}>{stat.trend}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Manage</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, index === QUICK_ACTIONS.length - 1 && styles.actionCardLast]}
              >
                <Feather name={action.icon} size={20} color="#2d9cdb" />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Drafts in progress</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>View all</Text>
            </TouchableOpacity>
          </View>
          {DRAFTS.map((draft) => (
            <TouchableOpacity key={draft.id} style={styles.recipeCard}>
              <ImageBackground
                source={{ uri: draft.cover }}
                style={styles.recipeCover}
                imageStyle={styles.recipeCoverImage}
              >
                <View style={styles.recipeOverlay} />
              </ImageBackground>
              <View style={styles.recipeBody}>
                <Text style={styles.recipeTitle}>{draft.title}</Text>
                <Text style={styles.recipeSummary}>{draft.summary}</Text>
                <View style={styles.recipeMetaRow}>
                  <Ionicons name="pencil-outline" size={14} color="#98a1b3" />
                  <Text style={styles.recipeMeta}>{draft.updatedAt}</Text>
                </View>
              </View>
              <View style={styles.recipeStats}>
                <View style={styles.recipeStatItem}>
                  <Ionicons name="eye-outline" size={16} color="#2d9cdb" />
                  <Text style={styles.recipeStatText}>{draft.stats.views}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Published</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Analytics</Text>
            </TouchableOpacity>
          </View>
          {PUBLISHED.map((recipe) => (
            <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
              <ImageBackground
                source={{ uri: recipe.cover }}
                style={styles.recipeCover}
                imageStyle={styles.recipeCoverImage}
              >
                <View style={styles.recipeOverlay} />
              </ImageBackground>
              <View style={styles.recipeBody}>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.recipeSummary}>{recipe.summary}</Text>
                <View style={styles.recipeMetaRow}>
                  <Ionicons name="time-outline" size={14} color="#98a1b3" />
                  <Text style={styles.recipeMeta}>{recipe.updatedAt}</Text>
                </View>
              </View>
              <View style={styles.recipeStats}>
                <View style={styles.recipeStatItem}>
                  <Ionicons name="bookmark-outline" size={16} color="#ff7a59" />
                  <Text style={styles.recipeStatText}>{recipe.stats.saves}</Text>
                </View>
                <View style={styles.recipeStatItem}>
                  <Ionicons name="eye-outline" size={16} color="#2d9cdb" />
                  <Text style={styles.recipeStatText}>{recipe.stats.views}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f7fa" },
  container: { paddingBottom: 56 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  eyebrow: { fontSize: 13, fontWeight: "500", color: "#98a1b3" },
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#2c2c2c", marginTop: 2 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#e6f3fb",
    alignItems: "center",
    justifyContent: "center",
  },
  statRow: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6 },
  statCard: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginRight: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statValue: { fontSize: 24, fontWeight: "700", color: "#2c2c2c" },
  statLabel: { marginTop: 4, color: "#52606d", fontWeight: "600" },
  statTrend: { marginTop: 6, color: "#98a1b3", fontSize: 12 },
  section: { marginTop: 26 },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#2c2c2c" },
  linkText: { color: "#2d9cdb", fontWeight: "600" },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 16,
    marginRight: 12,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  actionCardLast: { marginRight: 0 },
  actionLabel: { marginTop: 8, fontWeight: "600", color: "#2c2c2c" },
  recipeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  recipeCover: {
    width: 96,
    height: 96,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 14,
  },
  recipeCoverImage: { borderRadius: 16 },
  recipeOverlay: {
    flex: 1,
    backgroundColor: "rgba(21, 26, 34, 0.18)",
    borderRadius: 16,
  },
  recipeBody: { flex: 1 },
  recipeTitle: { fontSize: 16, fontWeight: "700", color: "#2c2c2c" },
  recipeSummary: { marginTop: 6, color: "#52606d", fontSize: 13, lineHeight: 18 },
  recipeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  recipeMeta: { marginLeft: 6, color: "#98a1b3", fontSize: 12 },
  recipeStats: {
    marginLeft: 12,
    alignItems: "flex-end",
  },
  recipeStatItem: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  recipeStatText: { marginLeft: 6, color: "#2c2c2c", fontWeight: "600" },
  bottomPadding: { height: 80 },
});
