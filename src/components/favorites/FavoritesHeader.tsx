import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function FavoritesHeader({
  count,
  onMore,
}: {
  count: number;
  onMore?: () => void;
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>Your Flavor Vault</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.title}>Favorites & Collections</Text>
          <View style={styles.badge}>
            <Ionicons name="bookmark" size={12} color="#2563EB" />
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.moreBtn} onPress={onMore}>
        <Feather name="more-horizontal" size={18} color="#2d9cdb" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.3,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#0f1724', marginLeft: 6 },
  moreBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#eef6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#e8f0ff',
    marginLeft: 10,
  },
  badgeText: { color: '#2563EB', fontWeight: '700', fontSize: 12 },
});
