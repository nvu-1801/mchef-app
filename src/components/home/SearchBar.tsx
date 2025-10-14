import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function SearchBar() {
  return (
    <View style={styles.searchRow}>
      <Ionicons
        name="search"
        size={20}
        color="#8895a7"
        style={styles.searchIcon}
      />
      <TextInput
        placeholder="Tìm kiếm công thức, đầu bếp, lớp học..."
        style={styles.searchInput}
        placeholderTextColor="#98a1b3"
      />
      <TouchableOpacity style={styles.filterBtn}>
        <MaterialIcons name="filter-list" size={22} color="#2d9cdb" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#eef2f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2c2c2c',
    paddingVertical: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
});
