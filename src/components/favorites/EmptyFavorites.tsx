import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EmptyFavorites() {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Ionicons name="bookmark-outline" size={22} color="#2563EB" />
      </View>
      <Text style={styles.title}>Chưa có món nào được lưu</Text>
      <Text style={styles.sub}>
        Lưu lại công thức bạn thích để truy cập nhanh ở đây.
      </Text>
      <Link href="/(main)/home" asChild>
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Khám phá công thức</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 28, paddingHorizontal: 20, alignItems: 'center' },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#e8f0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 12, fontSize: 18, fontWeight: '800', color: '#0f1724' },
  sub: { marginTop: 8, fontSize: 13, color: '#6b7280', textAlign: 'center' },
  btn: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
