import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Item = {
  id?: string;
  title?: string;
  time_minutes?: number;
  cover_image_url?: string;
};

export default function RecentRecipes({
  recent = [],
  onPressItem,
  isLoading = false,
}: {
  recent?: Item[];
  onPressItem?: (id?: string) => void;
  isLoading?: boolean;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent recipes</Text>
        <TouchableOpacity onPress={() => onPressItem?.(undefined)}>
          <Text style={styles.linkText}>See all</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#16a34a" />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      ) : recent.length === 0 ? (
        <View style={styles.emptyRecent}>
          <Ionicons name="document-text-outline" size={40} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No recent recipes</Text>
          <Text style={styles.emptySub}>
            Create your first recipe to see it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={recent}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16 }}
          keyExtractor={(i, idx) => i.id ?? i.title ?? `recent-${idx}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onPressItem?.(item.id)}
              style={styles.recentCard}
            >
              <Image
                source={{
                  uri: item.cover_image_url ?? 'https://picsum.photos/320/220',
                }}
                style={styles.recentImage}
              />
              <View style={styles.recentBody}>
                <Text style={styles.recentTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.recentMeta}>
                  <Ionicons name="time-outline" size={14} color="#6b7280" />
                  <Text style={styles.recentTime}>
                    {item.time_minutes ?? '-'} min
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0b3b20' },
  linkText: { color: '#16a34a', fontWeight: '700' },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 12,
  },
  loadingText: { color: '#6b7280', fontSize: 14 },
  emptyRecent: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  emptyTitle: { fontWeight: '800', color: '#374151', marginTop: 8 },
  emptySub: { color: '#94a3b8', marginTop: 6, textAlign: 'center' },
  recentCard: {
    width: 220,
    height: 140,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eef2f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  recentImage: { width: '100%', height: 86 },
  recentBody: { padding: 10 },
  recentTitle: { fontWeight: '800', color: '#0b3b20', fontSize: 14 },
  recentMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  recentTime: { marginLeft: 6, color: '#6b7280', fontSize: 12 },
});
