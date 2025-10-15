import React from 'react';
import {
  View,
  TouchableOpacity,
  ImageBackground,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CollectionsGrid({
  items,
  onShare,
}: {
  items: any[];
  onShare?: (t: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {items.map((c) => (
        <TouchableOpacity key={c.id} style={styles.card} activeOpacity={0.9}>
          <ImageBackground
            source={c.hero}
            style={styles.hero}
            imageStyle={styles.heroImage}
          >
            <View style={styles.overlay} />
            <View style={styles.body}>
              <Text style={styles.title}>{c.title}</Text>
              <Text style={styles.mood}>{c.mood}</Text>
              <View style={styles.footer}>
                <View style={styles.count}>
                  <Ionicons name="layers-outline" size={14} color="#fff" />
                  <Text style={styles.countText}>{c.recipes} recipes</Text>
                </View>
                <TouchableOpacity
                  style={styles.share}
                  onPress={() => onShare?.(c.title)}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={16}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  card: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  hero: { height: 180, justifyContent: 'flex-end' },
  heroImage: { borderRadius: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9,14,22,0.28)',
  },
  body: { padding: 14 },
  title: { color: '#fff', fontSize: 15, fontWeight: '800' },
  mood: { color: '#d0e6ff', marginTop: 6, fontSize: 12, fontWeight: '600' },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: { flexDirection: 'row', alignItems: 'center' },
  countText: { marginLeft: 6, color: '#fff', fontWeight: '700', fontSize: 12 },
  share: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
