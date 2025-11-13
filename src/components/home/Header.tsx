import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function Header() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>Welcome back</Text>
        <Text style={styles.headerTitle}>MChef Daily</Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="bookmark" size={20} color="#2d9cdb" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color="#2d9cdb" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarBtn}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  eyebrow: { color: '#98a1b3', fontSize: 13, fontWeight: '500' },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2c2c2c',
    marginTop: 2,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e6f3fb',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eef2f7',
    marginLeft: 12,
  },
  avatar: { width: '100%', height: '100%' },
});
