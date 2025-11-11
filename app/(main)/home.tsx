import React from 'react';
import {
  ScrollView,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useListDishesQuery } from '@/src/api/dishesApi';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'apps', color: '#2563EB' },
  { id: 'veg', name: 'Chay', icon: 'leaf', color: '#059669' },
  { id: 'nonveg', name: 'Mặn', icon: 'restaurant', color: '#dc2626' },
  { id: 'dessert', name: 'Tráng miệng', icon: 'ice-cream', color: '#f59e0b' },
  { id: 'drinks', name: 'Đồ uống', icon: 'cafe', color: '#8b5cf6' },
];

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data = [], isLoading, error, refetch } = useListDishesQuery({});
  const [selectedCat, setSelectedCat] = React.useState('all');

  // spotlight: first 5 dishes
  const spotlight = React.useMemo(
    () => (Array.isArray(data) ? data.slice(0, 5) : []),
    [data],
  );

  // veg dishes
  const vegDishes = React.useMemo(
    () =>
      Array.isArray(data)
        ? data.filter((d) => (d as any).diet === 'veg').slice(0, 6)
        : [],
    [data],
  );

  // filtered by category
  const filtered = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (selectedCat === 'all') return data;
    if (selectedCat === 'veg') return data.filter((d) => (d as any).diet === 'veg');
    if (selectedCat === 'nonveg') return data.filter((d) => (d as any).diet === 'nonveg');
    // for dessert/drinks: filter by category name (if available)
    return data.filter((d) =>
      (d as any).category?.name?.toLowerCase().includes(selectedCat),
    );
  }, [data, selectedCat]);

  const topInset =
    insets.top ||
    (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0);
  const bottomInset = insets.bottom ?? 0;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: topInset }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: topInset }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: 48 + bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Chào mừng</Text>
            <Text style={styles.title}>Khám phá món ngon</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(main)/profile')}>
            <Image
              source={{
                uri: 'https://i.pinimg.com/1200x/f5/51/48/f55148ad2ef92de8597008b60bcd29a8.jpg',
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(main)/dishes')}
        >
          <Ionicons name="search" size={20} color="#9ca3af" />
          <Text style={styles.searchPlaceholder}>Tìm món ăn, nguyên liệu...</Text>
        </TouchableOpacity>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCat === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCat(cat.id)}
                style={[
                  styles.catChip,
                  active && { backgroundColor: cat.color },
                ]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={18}
                  color={active ? '#fff' : cat.color}
                />
                <Text
                  style={[
                    styles.catText,
                    { color: active ? '#fff' : '#374151' },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Spotlight section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ Spotlight tuần này</Text>
            <Link href="/(main)/dishes" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Xem tất cả</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <FlatList
            data={spotlight}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20 }}
            keyExtractor={(i) => (i as any).id ?? Math.random()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/recipe/${(item as any).id}`)}
                style={styles.spotlightCard}
              >
                <Image
                  source={{
                    uri:
                      (item as any).images?.[0] ??
                      'https://picsum.photos/360/240',
                  }}
                  style={styles.spotlightImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)']}
                  style={styles.spotlightGradient}
                />
                <View style={styles.spotlightContent}>
                  <Text style={styles.spotlightTitle} numberOfLines={2}>
                    {(item as any).name}
                  </Text>
                  <View style={styles.spotlightMeta}>
                    <Ionicons name="time-outline" size={14} color="#fff" />
                    <Text style={styles.spotlightTime}>
                      {(item as any).time_minutes ?? '-'} phút
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Veg dishes section */}
        {vegDishes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="leaf" size={20} color="#059669" />
                <Text style={styles.sectionTitle}>Món chay</Text>
              </View>
              <Link href="/(main)/dishes?diet=veg" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Xem thêm</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <View style={styles.vegGrid}>
              {vegDishes.slice(0, 4).map((d) => (
                <TouchableOpacity
                  key={(d as any).id}
                  onPress={() => router.push(`/recipe/${(d as any).id}`)}
                  style={styles.vegCard}
                >
                  <Image
                    source={{
                      uri:
                        (d as any).images?.[0] ?? 'https://picsum.photos/200',
                    }}
                    style={styles.vegImage}
                  />
                  <View style={styles.vegBadge}>
                    <MaterialCommunityIcons name="leaf" size={12} color="#fff" />
                  </View>
                  <View style={styles.vegBody}>
                    <Text style={styles.vegTitle} numberOfLines={2}>
                      {(d as any).name}
                    </Text>
                    <Text style={styles.vegTime}>
                      {(d as any).time_minutes ?? '-'} phút
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* All dishes by selected category */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCat === 'all'
                ? 'Tất cả món ăn'
                : CATEGORIES.find((c) => c.id === selectedCat)?.name}
            </Text>
          </View>

          <View style={styles.allGrid}>
            {filtered.slice(0, 6).map((d) => (
              <TouchableOpacity
                key={(d as any).id}
                onPress={() => router.push(`/recipe/${(d as any).id}`)}
                style={styles.dishCard}
              >
                <Image
                  source={{
                    uri:
                      (d as any).images?.[0] ?? 'https://picsum.photos/200',
                  }}
                  style={styles.dishImage}
                />
                <View style={styles.dishBody}>
                  <Text style={styles.dishTitle} numberOfLines={2}>
                    {(d as any).name}
                  </Text>
                  <View style={styles.dishMeta}>
                    <Ionicons name="time-outline" size={12} color="#6b7280" />
                    <Text style={styles.dishTime}>
                      {(d as any).time_minutes ?? '-'}p
                    </Text>
                    <Ionicons
                      name="people-outline"
                      size={12}
                      color="#6b7280"
                      style={{ marginLeft: 8 }}
                    />
                    <Text style={styles.dishTime}>
                      {(d as any).servings ?? '-'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {filtered.length > 6 && (
            <TouchableOpacity
              onPress={() => router.push('/(main)/dishes')}
              style={styles.showMoreBtn}
            >
              <Text style={styles.showMoreText}>Xem thêm món</Text>
              <Ionicons name="arrow-forward" size={16} color="#16a34a" />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: { color: '#6b7280', fontWeight: '600', fontSize: 14 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 4 },
  avatar: { width: 48, height: 48, borderRadius: 24 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  searchPlaceholder: { color: '#9ca3af', flex: 1 },

  categoriesRow: { paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  catText: { fontWeight: '700', fontSize: 14 },

  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  linkText: { color: '#16a34a', fontWeight: '700' },

  spotlightCard: {
    width: 280,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#fff',
    position: 'relative',
  },
  spotlightImage: { width: '100%', height: '100%' },
  spotlightGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  spotlightContent: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  spotlightTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  spotlightMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  spotlightTime: { color: '#fff', fontWeight: '600' },

  vegGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  vegCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  vegImage: { width: '100%', height: 120 },
  vegBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegBody: { padding: 10 },
  vegTitle: { fontWeight: '800', color: '#111827', fontSize: 14 },
  vegTime: { color: '#6b7280', marginTop: 6, fontSize: 12 },

  allGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  dishCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dishImage: { width: '100%', height: 110 },
  dishBody: { padding: 10 },
  dishTitle: { fontWeight: '800', color: '#111827', fontSize: 13 },
  dishMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  dishTime: { marginLeft: 4, color: '#6b7280', fontSize: 11 },

  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  showMoreText: { color: '#16a34a', fontWeight: '700' },
});