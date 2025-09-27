import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Button,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ImageBackground,
} from 'react-native';
import type { ComponentProps } from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../src/hooks/hooks';
import { toggleFavorite } from '../../src/features/favorites/favoritesSlice';

import type { ImageBackgroundProps } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type FavoriteRecipe = {
  id: string;
  title: string;
  chef: string;
  cuisine: string;
  rating: number;
  saves: number;
  time: string;
  hero: ImageBackgroundProps['source'];
};

type Collection = {
  id: string;
  title: string;
  recipes: number;
  hero: ImageBackgroundProps['source'];
  mood: string;
};

const FAVORITE_RECIPES: FavoriteRecipe[] = [
  {
    id: 'fav-1',
    title: 'Caramelized Miso Salmon Bowl',
    chef: 'Sophia Nguyen',
    cuisine: 'Modern Asian',
    rating: 4.9,
    saves: 1283,
    time: '30 min',
    hero: {
      uri: 'https://images.unsplash.com/photo-1464061884326-64f6ebd57f83?w=900&h=700&fit=crop',
    },
  },
  {
    id: 'fav-2',
    title: 'Heirloom Tomato Burrata Toast',
    chef: 'Theo Laurent',
    cuisine: 'Market Fresh',
    rating: 4.8,
    saves: 986,
    time: '15 min',
    hero: {
      uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=700&fit=crop',
    },
  },
  {
    id: 'fav-3',
    title: 'Slow Braised Mushroom Ragù',
    chef: 'Amelia Tran',
    cuisine: 'Comfort',
    rating: 4.7,
    saves: 742,
    time: '1h 10 min',
    hero: {
      uri: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=900&h=700&fit=crop',
    },
  },
];

const CURATED_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    title: 'Weeknight Glow',
    recipes: 12,
    mood: 'Fast & nourishing',
    hero: {
      uri: 'https://images.unsplash.com/photo-1478145039860-247f9633fb94?w=900&h=700&fit=crop',
    },
  },
  {
    id: 'col-2',
    title: 'Gather & Graze',
    recipes: 9,
    mood: 'Dinner party friendly',
    hero: {
      uri: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&h=700&fit=crop',
    },
  },
  {
    id: 'col-3',
    title: 'Reset Rituals',
    recipes: 7,
    mood: 'Mindful mornings',
    hero: {
      uri: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=900&h=700&fit=crop',
    },
  },
];

const SEGMENTS = [
  { id: 'favorites', label: 'Saved recipes' },
  { id: 'collections', label: 'Curated blends' },
];

export default function FavoritesScreen() {
  const [segment, setSegment] =
    useState<(typeof SEGMENTS)[number]['id']>('favorites');

  async function handleShare(item: FavoriteRecipe | Collection) {
    try {
      await Share.share({
        message: `Check out this recipe on MChef: ${item.title}`,
      });
    } catch {
      // ignored
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Your Flavor Vault</Text>
            <Text style={styles.headerTitle}>Favorites & Collections</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="more-horizontal" size={18} color="#2d9cdb" />
          </TouchableOpacity>
        </View>

        <View style={styles.segmentRow}>
          {SEGMENTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.segmentBtn,
                segment === item.id && styles.segmentActive,
              ]}
              onPress={() => setSegment(item.id)}
            >
              <Text
                style={[
                  styles.segmentText,
                  segment === item.id && styles.segmentTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {segment === 'favorites' ? (
          <View>
            {FAVORITE_RECIPES.map((recipe) => (
              <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                <ImageBackground
                  source={recipe.hero}
                  style={styles.recipeHero}
                  imageStyle={styles.recipeHeroImage}
                >
                  <View style={styles.heroOverlay} />
                  <View style={styles.heroTopRow}>
                    <View style={styles.heroTag}>
                      <Ionicons name="time-outline" size={14} color="#fff" />
                      <Text style={styles.heroTagText}>{recipe.time}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleShare(recipe)}
                      style={styles.heroShare}
                    >
                      <Feather name="send" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>{recipe.title}</Text>
                    <View style={styles.heroMetaRow}>
                      <Text style={styles.heroMeta}>By {recipe.chef}</Text>
                      <View style={styles.heroMetaDivider} />
                      <Text style={styles.heroMeta}>{recipe.cuisine}</Text>
                    </View>
                    <View style={styles.heroStats}>
                      <View style={styles.heroStatItem}>
                        <Ionicons name="star" size={14} color="#f7b500" />
                        <Text style={styles.heroStatText}>
                          {recipe.rating.toFixed(1)}
                        </Text>
                      </View>
                      <View style={styles.heroStatItem}>
                        <Ionicons
                          name="bookmark-outline"
                          size={14}
                          color="#fff"
                        />
                        <Text style={styles.heroStatText}>
                          {recipe.saves.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.collectionGrid}>
            {CURATED_COLLECTIONS.map((collection) => (
              <TouchableOpacity
                key={collection.id}
                style={styles.collectionCard}
              >
                <ImageBackground
                  source={collection.hero}
                  style={styles.collectionHero}
                  imageStyle={styles.collectionHeroImage}
                >
                  <View style={styles.collectionOverlay} />
                  <View style={styles.collectionBody}>
                    <Text style={styles.collectionTitle}>
                      {collection.title}
                    </Text>
                    <Text style={styles.collectionMood}>{collection.mood}</Text>
                    <View style={styles.collectionFooter}>
                      <View style={styles.collectionCount}>
                        <Ionicons
                          name="layers-outline"
                          size={14}
                          color="#fff"
                        />
                        <Text style={styles.collectionCountText}>
                          {collection.recipes} recipes
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.collectionShare}
                        onPress={() => handleShare(collection)}
                      >
                        <Ionicons
                          name="share-social-outline"
                          size={16}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fa' },
  container: { paddingBottom: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  eyebrow: { fontSize: 13, fontWeight: '500', color: '#98a1b3' },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2c2c2c',
    marginTop: 2,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e6f3fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  segmentBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e8ee',
    marginRight: 10,
  },
  segmentActive: {
    backgroundColor: '#2d9cdb',
    borderColor: '#2d9cdb',
  },
  segmentText: { color: '#52606d', fontWeight: '600' },
  segmentTextActive: { color: '#fff' },
  recipeCard: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  recipeHero: {
    height: 240,
    justifyContent: 'space-between',
  },
  recipeHeroImage: { borderRadius: 22 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21, 26, 34, 0.4)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  heroTagText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 12,
  },
  heroShare: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: { paddingHorizontal: 18, paddingBottom: 20 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 26 },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  heroMeta: { color: '#f5f7fa', fontSize: 13 },
  heroMetaDivider: {
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 10,
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: 14,
  },
  heroStatItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  heroStatText: { marginLeft: 6, color: '#fff', fontWeight: '600' },
  collectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  collectionCard: {
    width: '48%',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  collectionHero: {
    height: 200,
    justifyContent: 'flex-end',
  },
  collectionHeroImage: { borderRadius: 20 },
  collectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21, 26, 34, 0.38)',
  },
  collectionBody: { padding: 16 },
  collectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  collectionMood: { color: '#d0e6ff', marginTop: 6, fontSize: 12 },
  collectionFooter: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collectionCount: { flexDirection: 'row', alignItems: 'center' },
  collectionCountText: {
    marginLeft: 6,
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  collectionShare: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: { height: 80 },
});
