import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FavoriteButton } from '@/src/components/common/FavoriteButton';

export default function RecipeList({
  data = [],
  onRefresh,
}: {
  data: any[];
  onRefresh?: () => void;
}) {
  function chefNameFor(item: any) {
    return item.chef ?? item.author?.name ?? item.created_by?.name ?? 'MChef';
  }
  function timeText(item: any) {
    if (item.time_minutes) return `${item.time_minutes} min`;
    if (item.time) return String(item.time);
    return '—';
  }

  return (
    <View>
      {data.map((item) => (
        <Link
          key={item.id}
          href={{ pathname: '/recipe/[id]', params: { id: item.id } }}
          asChild
        >
          <TouchableOpacity style={styles.card}>
            <Image
              source={{ uri: item.images?.[0] ?? '' }}
              style={styles.cardImage}
            />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.cardChef}>{chefNameFor(item)}</Text>

              <View style={styles.cardMetaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#98a1b3" />
                  <Text style={styles.metaText}>{timeText(item)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons
                    name={
                      item.diet === 'veg'
                        ? 'leaf-outline'
                        : 'restaurant-outline'
                    }
                    size={14}
                    color="#98a1b3"
                  />
                  <Text style={styles.metaText}>
                    {item.diet === 'veg' ? 'Veg' : 'Non-veg'}
                  </Text>
                </View>
              </View>
            </View>

            <FavoriteButton
              dish={item}
              mode="icon"
              stopNavigation
              style={styles.saveBtn}
            />
          </TouchableOpacity>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    padding: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardImage: { width: 84, height: 84, borderRadius: 12, marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#2c2c2c' },
  cardChef: { marginTop: 6, color: '#8895a7', fontSize: 13 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  metaText: { marginLeft: 6, color: '#6b7280' },
  saveBtn: { padding: 6 },
});
