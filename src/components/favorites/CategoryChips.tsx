import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CategoryChips({
  categories,
  active,
  onSelect,
}: {
  categories: string[];
  active: string;
  onSelect: (c: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingLeft: 20 }}
      style={styles.wrap}
    >
      {categories.map((c) => {
        const isActive = c === active;
        return (
          <TouchableOpacity
            key={c}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(c)}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12, marginBottom: 6 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eef3fb',
    marginRight: 10,
    marginBottom: 6,
  },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  text: { color: '#274154', fontWeight: '700' },
  textActive: { color: '#fff' },
});
