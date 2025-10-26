import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  count: number;
};

export default function FavoritesHeader({ count }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.eyebrow}>Your Collection</Text>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.count}>
          {count} {count === 1 ? 'recipe' : 'recipes'} saved
        </Text>
      </View>

      <TouchableOpacity style={styles.filterBtn}>
        <LinearGradient
          colors={['#16a34a', '#15803d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Feather name="sliders" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  count: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  filterBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#16a34a',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  gradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
