import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Image,
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default function CollectionsCarousel({ items = [] }: { items?: any[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map((c) => (
        <TouchableOpacity key={c.id} style={styles.card}>
          <Image source={{ uri: c.image }} style={styles.image} />
          <View style={styles.body}>
            <Text style={styles.title}>{c.title}</Text>
            <Text style={styles.meta}>{c.recipes} recipes</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 20, paddingBottom: 10 },
  card: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  image: { width: '100%', height: 110 },
  body: { padding: 12 },
  title: { fontSize: 14, fontWeight: '700', color: '#2c2c2c' },
  meta: { marginTop: 4, color: '#8895a7', fontSize: 12 },
});
