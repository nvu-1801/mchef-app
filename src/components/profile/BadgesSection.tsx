import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Badge = { id?: string; name?: string; icon?: string };

export default function BadgesSection({
  badges = [],
  onViewAll,
}: {
  badges?: Badge[];
  onViewAll?: () => void;
}) {
  if (!badges || badges.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.linkText}>View all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgeRow}
      >
        {badges.map((b) => (
          <View key={b.id ?? b.name} style={styles.badgeCard}>
            <MaterialCommunityIcons
              name={(b.icon as any) ?? 'star'}
              size={26}
              color="#ff8a65"
            />
            <Text style={styles.badgeLabel}>{b.name}</Text>
          </View>
        ))}
      </ScrollView>
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
  badgeRow: { paddingHorizontal: 16, paddingBottom: 8 },
  badgeCard: {
    width: 120,
    height: 96,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeLabel: {
    marginTop: 8,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    fontSize: 12,
  },
});
