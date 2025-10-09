// app/(main)/favorites.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ImageBackground,
  Animated,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';

import { FavoriteButton } from '@/src/components/common/FavoriteButton';
import {
  selectFavoriteEntries,
  type FavoriteEntry,
} from '@/src/features/favorites/favoritesSlice';
import { useAppSelector } from '@/src/hooks/hooks';

type Collection = {
  id: string;
  title: string;
  recipes: number;
  hero: { uri: string };
  mood: string;
};

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
] as const;

export default function FavoritesScreen() {
  const favorites: FavoriteEntry[] = useAppSelector(selectFavoriteEntries);
  const [segment, setSegment] =
    useState<(typeof SEGMENTS)[number]['id']>('favorites');

  // Animated indicator for segment
  const indX = useRef(new Animated.Value(0)).current;
  const onSwitch = (idx: number, id: typeof segment) => {
    setSegment(id);
    Animated.spring(indX, {
      toValue: idx,
      bounciness: 10,
      useNativeDriver: false,
    }).start();
  };

  const favCount = favorites.length;

  async function handleShare(title: string) {
    try {
      await Share.share({ message: `Check this out on MChef: ${title}` });
    } catch {}
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Your Flavor Vault</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.headerTitle}>Favorites & Collections</Text>
              <View style={styles.badge}>
                <Ionicons name="bookmark" size={12} color="#2563EB" />
                <Text style={styles.badgeText}>{favCount}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="more-horizontal" size={18} color="#2d9cdb" />
          </TouchableOpacity>
        </View>

        {/* Segmented */}
        <View style={styles.segmentWrap}>
          <View style={styles.segmentTrack}>
            <Animated.View
              style={[
                styles.segmentIndicator,
                {
                  left: indX.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['2%', '50.5%'],
                  }),
                },
              ]}
            />
            {SEGMENTS.map((s, i) => (
              <TouchableOpacity
                key={s.id}
                style={styles.segmentBtn}
                onPress={() => onSwitch(i, s.id)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    segment === s.id && styles.segmentTextActive,
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        {segment === 'favorites' ? (
          favCount > 0 ? (
            <View style={{ gap: 16 }}>
              {favorites.filter(Boolean).map((f) => (
                <Link
                  key={f.id}
                  href={{ pathname: '/recipe/[id]', params: { id: f.id } }}
                  asChild
                >
                  <TouchableOpacity style={styles.recipeCard}>
                    <ImageBackground
                      source={{ uri: f.image ?? 'https://picsum.photos/900/700?blur=3' }}
                      style={styles.recipeHero}
                      imageStyle={styles.recipeHeroImage}
                    >
                      {/* gradient overlay */}
                      <View style={styles.gradientOverlay} />
                      {/* top row */}
                      <View style={styles.heroTopRow}>
                        <View style={styles.heroTag}>
                          <Ionicons name="time-outline" size={14} color="#fff" />
                          <Text style={styles.heroTagText}>
                            {typeof f.time_minutes === 'number' ? `${f.time_minutes} min` : 'Quick & easy'}
                          </Text>
                        </View>

                        <TouchableOpacity onPress={() => handleShare(f.name ?? 'Recipe')} style={styles.heroShare}>
                          <Feather name="send" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>

                      {/* bottom info */}
                      <View style={styles.heroContent}>
                        <Text style={styles.heroTitle} numberOfLines={2}>
                          {f.name ?? 'Saved recipe'}
                        </Text>
                        <View style={styles.heroMetaRow}>
                          <Ionicons name="pricetag-outline" size={14} color="#e5eefc" />
                          <Text style={styles.heroMeta}>
                            {f.categoryName ?? 'MChef'}
                          </Text>
                        </View>
                      </View>

                      {/* save btn */}
                      <FavoriteButton
                        entry={f}
                        mode="icon"
                        stopNavigation
                        style={styles.favFloating}
                      />
                    </ImageBackground>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="bookmark-outline" size={22} color="#2563EB" />
              </View>
              <Text style={styles.emptyTitle}>Chưa có món nào được lưu</Text>
              <Text style={styles.emptySub}>
                Lưu lại công thức bạn thích để truy cập nhanh ở đây.
              </Text>
              <Link href="/recipe/[id]" asChild>
                <TouchableOpacity style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>Khám phá công thức</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )
        ) : (
          <View style={styles.collectionGrid}>
            {CURATED_COLLECTIONS.map((c) => (
              <TouchableOpacity key={c.id} style={styles.collectionCard}>
                <ImageBackground
                  source={c.hero}
                  style={styles.collectionHero}
                  imageStyle={styles.collectionHeroImage}
                >
                  <View style={styles.collectionOverlay} />
                  <View style={styles.collectionBody}>
                    <Text style={styles.collectionTitle}>{c.title}</Text>
                    <Text style={styles.collectionMood}>{c.mood}</Text>
                    <View style={styles.collectionFooter}>
                      <View style={styles.collectionCount}>
                        <Ionicons name="layers-outline" size={14} color="#fff" />
                        <Text style={styles.collectionCountText}>
                          {c.recipes} recipes
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.collectionShare}
                        onPress={() => handleShare(c.title)}
                      >
                        <Ionicons name="share-social-outline" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8fb' },
  container: { paddingBottom: 32 },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  eyebrow: { fontSize: 12, fontWeight: '600', color: '#8ea2b6', letterSpacing: 0.3 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1f2a37' },
  headerBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#e6f3fb', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, backgroundColor: '#e8f0ff',
  },
  badgeText: { color: '#2563EB', fontWeight: '700', fontSize: 12 },

  /* Segment */
  segmentWrap: { paddingHorizontal: 20, marginTop: 14 },
  segmentTrack: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1, borderColor: '#e3e8ee',
    flexDirection: 'row',
    position: 'relative',
    padding: 2,
  },
  segmentIndicator: {
    position: 'absolute',
    top: 2,
    width: '47.5%',
    height: '92%',
    backgroundColor: '#2d9cdb',
    borderRadius: 14,
    zIndex: 0,
  },
  segmentBtn: {
    width: '50%',
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  segmentText: { color: '#52606d', fontWeight: '700' },
  segmentTextActive: { color: '#fff' },

  /* Recipe card */
  recipeCard: {
    marginHorizontal: 20, marginTop: 16,
    borderRadius: 22, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 2,
    backgroundColor: '#fff',
  },
  recipeHero: { height: 240, justifyContent: 'space-between' },
  recipeHeroImage: { borderRadius: 22 },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  heroTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16,
  },
  heroTag: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.28)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  heroTagText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  heroShare: {
    width: 36, height: 36, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  heroContent: { paddingHorizontal: 16, paddingBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 26, textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 10 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  heroMeta: { color: '#e5eefc', fontSize: 12, fontWeight: '600' },

  favFloating: {
    position: 'absolute', right: 12, bottom: 12,
  },

  /* Collections */
  collectionGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, gap: 12,
  },
  collectionCard: {
    width: '48%', borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 }, elevation: 2,
    backgroundColor: '#fff',
  },
  collectionHero: { height: 200, justifyContent: 'flex-end' },
  collectionHeroImage: { borderRadius: 20 },
  collectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21, 26, 34, 0.32)',
  },
  collectionBody: { padding: 14 },
  collectionTitle: { color: '#fff', fontSize: 16, fontWeight: '800', lineHeight: 22 },
  collectionMood: { color: '#d0e6ff', marginTop: 6, fontSize: 12, fontWeight: '600' },
  collectionFooter: {
    marginTop: 14, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  collectionCount: { flexDirection: 'row', alignItems: 'center' },
  collectionCountText: { marginLeft: 6, color: '#fff', fontWeight: '700', fontSize: 12 },
  collectionShare: {
    width: 32, height: 32, borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Empty */
  emptyWrap: {
    marginTop: 28, paddingHorizontal: 20, alignItems: 'center',
  },
  emptyIcon: {
    width: 52, height: 52, borderRadius: 18,
    backgroundColor: '#e8f0ff', alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: '800', color: '#1f2a37' },
  emptySub: { marginTop: 6, fontSize: 13, color: '#6b7280', textAlign: 'center' },
  emptyBtn: {
    marginTop: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, backgroundColor: '#2d9cdb',
  },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
});
