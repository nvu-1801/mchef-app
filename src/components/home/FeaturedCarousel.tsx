import React from 'react';
import {
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';

const { width: SCREEN_W } = Dimensions.get('window');

type Feature = { id: string; title: string; subtitle: string; image: string };

export default function FeaturedCarousel({
  items,
  loading,
}: {
  items: Feature[];
  loading?: boolean;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.featureRow}
    >
      {loading ? (
        <ActivityIndicator style={{ marginHorizontal: 20 }} />
      ) : (
        items.map((item) => (
          <Link
            key={item.id}
            href={{ pathname: '/recipe/[id]', params: { id: item.id } }}
            asChild
          >
            <TouchableOpacity activeOpacity={0.9} style={styles.featureCard}>
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.featureCardBg}
                imageStyle={{ borderRadius: 16 }}
              >
                <View style={styles.overlay} />
                <View style={styles.inner}>
                  <Text style={styles.badge}>Chef's pick</Text>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.desc} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </Link>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  featureRow: { paddingHorizontal: 20, paddingTop: 18 },
  featureCard: {
    width: Math.round(SCREEN_W * 0.72),
    height: 180,
    marginRight: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureCardBg: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,26,34,0.32)',
  },
  inner: { padding: 16 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginBottom: 8,
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  desc: { color: '#f5f7fa', marginTop: 6, fontSize: 13 },
});
