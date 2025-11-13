import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function EmptyState() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
      <Text style={styles.title}>No recipes yet</Text>
      <Text style={styles.subtitle}>
        Create your first recipe to get started
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(main)/chef/new')}
      >
        <Text style={styles.buttonText}>Create Recipe</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    color: '#2c2c2c',
  },
  subtitle: { color: '#98a1b3', marginTop: 8, textAlign: 'center' },
  button: {
    marginTop: 24,
    backgroundColor: '#2d9cdb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: { color: '#fff', fontWeight: '700' },
});
