import React from 'react';
import { Pressable, Text, View, GestureResponderEvent, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/src/hooks/hooks';
import { toggleFavorite } from '@/src/features/favorites/favoritesSlice';

type Mode = 'icon' | 'pill' | 'action';

export function FavoriteButton({
  dishId,
  mode = 'pill',
  stopNavigation = false,   // dùng true nếu button nằm trong <Link asChild>
  style,
  labelOn = 'Saved',
  labelOff = 'Save',
  iconSize = 18,
}: {
  dishId: string;
  mode?: Mode;
  stopNavigation?: boolean;
  style?: ViewStyle;
  labelOn?: string;
  labelOff?: string;
  iconSize?: number;
}) {
  const dispatch = useAppDispatch();
  const isFav = useAppSelector((s) => s.favorites.items.includes(dishId));

  const onPress = (e?: GestureResponderEvent) => {
    if (stopNavigation && e?.preventDefault) e.preventDefault();
    dispatch(toggleFavorite({ dishId }));
  };

  if (mode === 'icon') {
    return (
      <Pressable onPress={onPress} style={[styles.iconBtn, style]}>
        <Ionicons
          name={isFav ? 'bookmark' : 'bookmark-outline'}
          size={iconSize}
          color={isFav ? '#2563EB' : '#111827'}
        />
      </Pressable>
    );
  }

  if (mode === 'action') {
    return (
      <Pressable onPress={onPress} style={[styles.actionBtn, style]}>
        <Ionicons
          name={isFav ? 'bookmark' : 'bookmark-outline'}
          size={iconSize}
          color={'#111827'}
        />
        <Text style={styles.actionText}>{isFav ? labelOn : labelOff}</Text>
      </Pressable>
    );
  }

  // mode === 'pill'
  return (
    <Pressable onPress={onPress} style={[styles.pillBtn, style]}>
      <Ionicons
        name={isFav ? 'bookmark' : 'bookmark-outline'}
        size={iconSize}
        color={isFav ? '#2563EB' : '#111827'}
      />
      <Text style={[styles.pillText, { color: isFav ? '#2563EB' : '#111827' }]}>
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
    flexDirection: 'row', gap: 8,
    alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  pillText: { fontWeight: '600' },
  actionBtn: {
    flex: 1, flexDirection: 'row', gap: 8,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12,
  },
  actionText: { fontWeight: '600' },
});
