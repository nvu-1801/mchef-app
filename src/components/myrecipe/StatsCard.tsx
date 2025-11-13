import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

type StatsCardProps = {
  label: string;
  value: number;
  trend: string;
  icon: IconName;
  iconColor: string;
};

export function StatsCard({
  label,
  value,
  trend,
  icon,
  iconColor,
}: StatsCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.trend}>{trend}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginRight: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  value: { fontSize: 24, fontWeight: '700', color: '#2c2c2c' },
  label: { marginTop: 4, color: '#52606d', fontWeight: '600' },
  trend: { marginTop: 6, color: '#98a1b3', fontSize: 12 },
});
