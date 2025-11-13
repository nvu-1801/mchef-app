import React from 'react';
import {
  TouchableOpacity,
  ImageBackground,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { FavoriteButton } from '@/src/components/common/FavoriteButton';

export default function FavoriteRecipeCard({
  item,
  onShare,
}: {
  item: any;
  onShare: (t: string) => void;
}) {
  return (
    <Link href={{ pathname: '/recipe/[id]', params: { id: item.id } }} asChild>
      <TouchableOpacity activeOpacity={0.9} style={styles.card}>
        <ImageBackground
          source={{ uri: item.image ?? 'https://picsum.photos/900/700?blur=3' }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.overlay} />
          <View style={styles.topRow}>
            <View style={styles.tag}>
              <Ionicons name="time-outline" size={14} color="#fff" />
              <Text style={styles.tagText}>
                {typeof item.time_minutes === 'number'
                  ? `${item.time_minutes} min`
                  : 'Quick'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onShare(item.name ?? 'Recipe')}
              style={styles.share}
            >
              <Feather name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottom}>
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>
                {item.name ?? 'Saved recipe'}
              </Text>
              <View style={styles.metaRow}>
                <Ionicons name="pricetag-outline" size={14} color="#6b7280" />
                <Text style={styles.meta}>{item.categoryName ?? 'MChef'}</Text>
              </View>
            </View>
          </View>

          <FavoriteButton
            entry={item}
            mode="icon"
            stopNavigation
            style={styles.fav}
          />
        </ImageBackground>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  hero: { height: 240, justifyContent: 'space-between' },
  heroImage: { borderRadius: 20 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,10,20,0.28)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: { color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 12 },
  share: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  bottom: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'flex-start',
  },
  info: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  title: { color: '#0f1724', fontSize: 16, fontWeight: '800', lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  meta: { color: '#6b7280', fontSize: 13, marginLeft: 8 },
  fav: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
  },
});
