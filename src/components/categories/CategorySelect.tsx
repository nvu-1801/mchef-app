// src/components/categories/CategorySelect.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCategories } from '@/src/modules/categories/useCategories';

type Props = {
  value?: string | null;                 // category_id
  onChange: (id: string) => void;
  placeholder?: string;
};

export default function CategorySelect({ value, onChange, placeholder = 'Select category' }: Props) {
  const { data: cats, loading } = useCategories();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return cats;
    return cats.filter(c =>
      c.name.toLowerCase().includes(keyword) || c.slug.toLowerCase().includes(keyword)
    );
  }, [q, cats]);

  const current = cats.find(c => c.id === value);

  return (
    <View>
      <TouchableOpacity
        style={styles.selectBtn}
        onPress={() => setOpen(v => !v)}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.selectText}>{current ? current.name : placeholder}</Text>
        {loading ? <ActivityIndicator size="small" /> :
          <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#6b7280" />}
      </TouchableOpacity>

      {open && (
        <View style={styles.panel}>
          <View style={styles.searchRow}>
            <Feather name="search" size={16} color="#9ca3af" />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search category..."
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
            />
            {q ? (
              <TouchableOpacity onPress={() => setQ('')}>
                <Feather name="x-circle" size={16} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
            {filtered.map(c => {
              const active = c.id === value;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.item, active && styles.itemActive]}
                  onPress={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.itemText, active && styles.itemTextActive]}>
                    {c.name} <Text style={styles.slug}>({c.slug})</Text>
                  </Text>
                  {active && <Feather name="check" size={16} color="#16a34a" />}
                </TouchableOpacity>
              );
            })}
            {filtered.length === 0 && (
              <Text style={styles.nores}>No categories</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selectBtn: {
    minHeight: 48, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12,
    borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  selectText: { color: '#111827', fontSize: 15, fontWeight: '600' },
  panel: {
    marginTop: 8, borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb',
    backgroundColor: '#fff', overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  searchInput: { flex: 1, paddingVertical: 6, color: '#111827' },
  item: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemActive: { backgroundColor: '#f0fdf4' },
  itemText: { color: '#111827', fontSize: 15 },
  itemTextActive: { color: '#16a34a', fontWeight: '700' },
  slug: { color: '#9ca3af' },
  nores: { paddingHorizontal: 14, paddingVertical: 12, color: '#9ca3af' },
});
