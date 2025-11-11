// src/components/common/ImagePreview.tsx
import React, { useState } from 'react';
import { View, Image, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Props = {
  uri?: string | null;
  height?: number;
  radius?: number;
  onPress?: () => void; // optional: tap to open link
};

export default function ImagePreview({ uri, height = 160, radius = 14, onPress }: Props) {
  const [loading, setLoading] = useState(!!uri);
  const [error, setError] = useState(false);

  const body = (
    <View style={[styles.wrap, { height, borderRadius: radius }]}>
      {!uri ? (
        <View style={styles.empty}>
          <Feather name="image" size={22} color="#9ca3af" />
          <Text style={styles.emptyText}>No image</Text>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Feather name="alert-triangle" size={20} color="#f59e0b" />
          <Text style={styles.emptyText}>Invalid image URL</Text>
        </View>
      ) : (
        <>
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator />
            </View>
          )}
          <Image
            source={{ uri }}
            style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            resizeMode="cover"
          />
        </>
      )}
    </View>
  );

  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.8}>{body}</TouchableOpacity>;
  return body;
}

const styles = StyleSheet.create({
  wrap: { width: '100%', backgroundColor: '#f3f4f6', overflow: 'hidden' },
  loader: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  emptyText: { color: '#9ca3af', fontSize: 12, fontWeight: '600' },
});
