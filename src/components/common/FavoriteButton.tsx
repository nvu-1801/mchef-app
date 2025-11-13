// src/components/common/FavoriteButton.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/src/hooks/hooks';
import {
  FavoriteEntry,
  toggleFavorite,
  selectIsFav,
} from '@/src/features/favorites/favoritesSlice';
import type { Dish } from '@/src/api/dishesApi';

function toEntryFromDish(d: Dish): FavoriteEntry {
  return {
    id: d.id,
    name: d.name,
    image: d.images?.[0] ?? null,
    slug: d.slug,
    categoryName: d.category?.name ?? null,
    time_minutes: d.time_minutes ?? null,
    diet: (d.diet as string) ?? null,
  };
}

type Mode = 'icon' | 'pill' | 'action';

export function FavoriteButton({
  dish,
  entry,
  id,                  // ✅ fallback cuối cùng
  mode = 'pill',
  stopNavigation = false,
  style,
  iconSize = 18,
  labelOn = 'Saved',
  labelOff = 'Save',
}: {
  dish?: Dish;
  entry?: FavoriteEntry;
  id?: string;
  mode?: Mode;
  stopNavigation?: boolean;
  style?: ViewStyle;
  iconSize?: number;
  labelOn?: string;
  labelOff?: string;
}) {
  const snapshot: FavoriteEntry | undefined =
    entry ?? (dish ? toEntryFromDish(dish) : id ? { id } : undefined);

  const favId = snapshot?.id ?? '';
  const isFav = useAppSelector(selectIsFav(favId));
  const dispatch = useAppDispatch();

  const onPress = (e?: any) => {
    if (stopNavigation && e?.preventDefault) e.preventDefault(); // RN web chỉ
    if (!snapshot?.id) {
      console.warn('[FavoriteButton] Missing snapshot/id – skip dispatch');
      return;
    }
    dispatch(toggleFavorite(snapshot));
  };

  const iconName = isFav ? 'bookmark' : 'bookmark-outline';
  const iconColor = isFav ? '#2563EB' : '#111827';

  if (mode === 'icon') {
    return (
      <Pressable onPress={onPress} style={[styles.iconBtn, style]}>
        <Ionicons name={iconName} size={iconSize} color={iconColor} />
      </Pressable>
    );
  }

  if (mode === 'action') {
    return (
      <Pressable onPress={onPress} style={[styles.actionBtn, style]}>
        <Ionicons name={iconName} size={iconSize} color="#111827" />
        <Text style={styles.actionText}>{isFav ? labelOn : labelOff}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={[styles.pillBtn, style]}>
      <Ionicons name={iconName} size={iconSize} color={iconColor} />
      <Text style={[styles.pillText, { color: iconColor }]}>
        {isFav ? labelOn : labelOff}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  pillBtn: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff',
  },
  pillText: { fontWeight: '600' },
  actionBtn: {
    flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12,
  },
  actionText: { fontWeight: '600' },
});
