import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

type Action = {
  id: string;
  label: string;
  icon: FeatherIconName;
  route: string;
};

const ACTIONS: Action[] = [
  { id: '1', label: 'New recipe', icon: 'plus', route: '/(main)/chef/new' },
  { id: '2', label: 'All recipes', icon: 'list', route: '/(main)/chef' },
  { id: '3', label: 'Settings', icon: 'settings', route: '/settings' },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick actions</Text>
      </View>
      <View style={styles.grid}>
        {ACTIONS.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.card,
              index === ACTIONS.length - 1 && styles.cardLast,
            ]}
            onPress={() => router.push(action.route as any)}
          >
            <Feather name={action.icon} size={20} color="#2d9cdb" />
            <Text style={styles.label}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 26 },
  header: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#2c2c2c' },
  grid: { flexDirection: 'row', paddingHorizontal: 20 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginRight: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardLast: { marginRight: 0 },
  label: { marginTop: 8, fontWeight: '600', color: '#2c2c2c' },
});
