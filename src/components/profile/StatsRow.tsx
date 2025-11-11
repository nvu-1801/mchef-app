import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Counts = { recipes?: number; followers?: number | string; saved?: number };

export default function StatsRow({
  counts = { recipes: 0, followers: 0, saved: 0 },
}: {
  counts?: Counts;
}) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{counts.recipes ?? 0}</Text>
        <Text style={styles.statLabel}>Recipes</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{counts.followers ?? 0}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{counts.saved ?? 0}</Text>
        <Text style={styles.statLabel}>Saved</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontWeight: '800', color: '#052e16', fontSize: 16 },
  statLabel: { color: '#6b7280', marginTop: 4, fontSize: 12 },
});
