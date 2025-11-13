// app/(main)/favorites.tsx
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '@/src/hooks/hooks';
import {
  selectFavoriteEntries,
  type FavoriteEntry,
} from '@/src/features/favorites/favoritesSlice';

import FavoritesHeader from '../../src/components/favorites/FavoritesHeader';
import SegmentControl from '../../src/components/favorites/SegmentControl';
import CategoryChips from '../../src/components/favorites/CategoryChips';
import FavoriteRecipeCard from '../../src/components/favorites/FavoriteRecipeCard';
import CollectionsGrid from '../../src/components/favorites/CollectionsGrid';
import EmptyFavorites from '../../src/components/favorites/EmptyFavorites';

const SEGMENTS = [
  { id: 'favorites', label: 'Saved recipes' },
  { id: 'collections', label: 'Curated blends' },
] as const;

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const topInset =
    insets.top ||
    (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 12) : 12);
  const bottomInset = insets.bottom ?? 12;

  const favorites: FavoriteEntry[] = useAppSelector(selectFavoriteEntries);
  const [activeSegment, setActiveSegment] = useState(0);

  const categories = useMemo(() => {
    const set = new Set<string>();
    favorites.forEach((f) => set.add(f.categoryName ?? 'Uncategorized'));
    return ['All', ...Array.from(set)];
  }, [favorites]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredFavorites = useMemo(() => {
    if (SEGMENTS[activeSegment].id !== 'favorites') return [];
    if (activeCategory === 'All') return favorites;
    return favorites.filter(
      (f) => (f.categoryName ?? 'Uncategorized') === activeCategory,
    );
  }, [favorites, activeCategory, activeSegment]);

  const handleShare = async (title: string) => {
    try {
      await Share.share({ message: `Check this out on MChef: ${title}` });
    } catch {}
  };

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: topInset }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 32 + bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <FavoritesHeader count={favorites.length} />

        <View style={styles.segmentWrapper}>
          <SegmentControl
            segments={SEGMENTS as any}
            activeIndex={activeSegment}
            onChange={(i) => setActiveSegment(i)}
          />
        </View>

        {SEGMENTS[activeSegment].id === 'favorites' && (
          <>
            <CategoryChips
              categories={categories}
              active={activeCategory}
              onSelect={setActiveCategory}
            />
            <View style={styles.cardList}>
              {filteredFavorites.length > 0 ? (
                filteredFavorites.map((f) => (
                  <FavoriteRecipeCard
                    key={f.id}
                    item={f}
                    onShare={handleShare}
                  />
                ))
              ) : (
                <EmptyFavorites />
              )}
            </View>
          </>
        )}

        {SEGMENTS[activeSegment].id === 'collections' && (
          <CollectionsGrid
            items={[
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
            ]}
            onShare={handleShare}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  scroll: {
    paddingHorizontal: 0,
  },
  segmentWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cardList: {
    paddingHorizontal: 16,
  },
});
