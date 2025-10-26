// app/(main)/dishes.tsx
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  TextInput,
  View,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useListDishesQuery } from '@/src/api/dishesApi';
import { FavoriteButton } from '@/src/components/common/FavoriteButton';
import type { Dish } from '@/src/types/dish';

type Section = { title: string; data: Dish[] };

export default function DishesScreen() {
  const insets = useSafeAreaInsets();
  const topInset =
    insets.top ||
    (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0);
  const bottomInset = insets.bottom ?? 0;

  const [showSearch, setShowSearch] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [submittedQ, setSubmittedQ] = React.useState<string | undefined>(
    undefined,
  );

  const {
    data = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useListDishesQuery();

  const sections: Section[] = React.useMemo(() => {
    if (!data?.length) return [];
    const byCat = new Map<string, Dish[]>();
    for (const d of data) {
      const key = d.category?.name?.trim() || 'Khác';
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key)!.push(d);
    }
    return Array.from(byCat.entries())
      .sort((a, b) => a[0].localeCompare(b[0], 'vi'))
      .map(([title, items]) => ({
        title,
        data: items.sort((x, y) => x.name.localeCompare(y.name, 'vi')),
      }));
  }, [data]);

  const onSubmitSearch = React.useCallback(() => {
    setSubmittedQ(q.trim() || undefined);
  }, [q]);

  const onCancelSearch = React.useCallback(() => {
    setShowSearch(false);
    setQ('');
    setSubmittedQ(undefined);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
        <Text style={styles.errorTitle}>Không thể tải danh sách món</Text>
        <Text style={styles.errorSub}>
          Vui lòng kiểm tra kết nối và thử lại
        </Text>
        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: topInset }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 32 + bottomInset },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor="#2563EB"
          />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.topBar}>
              <View>
                <Text style={styles.eyebrow}>Khám phá</Text>
                <Text style={styles.mainTitle}>Tất cả công thức</Text>
              </View>
              <Pressable style={styles.filterBtn}>
                <Feather name="sliders" size={20} color="#2563EB" />
              </Pressable>
            </View>

            {!showSearch ? (
              <Pressable
                onPress={() => setShowSearch(true)}
                style={styles.searchToggle}
              >
                <Ionicons name="search" size={20} color="#6b7280" />
                <Text style={styles.searchToggleText}>
                  Tìm món ăn, nguyên liệu...
                </Text>
              </Pressable>
            ) : (
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#6b7280" />
                <TextInput
                  value={q}
                  onChangeText={setQ}
                  placeholder="Nhập từ khoá..."
                  style={styles.searchInput}
                  returnKeyType="search"
                  onSubmitEditing={onSubmitSearch}
                  autoFocus
                  placeholderTextColor="#9ca3af"
                />
                {q.length > 0 && (
                  <Pressable onPress={() => setQ('')} style={styles.clearBtn}>
                    <Ionicons name="close-circle" size={18} color="#9ca3af" />
                  </Pressable>
                )}
                <Pressable onPress={onCancelSearch} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Huỷ</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={16} color="#2563EB" />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{section.data.length}</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const img = item.images?.[0];
          return (
            <Link
              href={{ pathname: '/recipe/[id]', params: { id: item.id } }}
              asChild
            >
              <Pressable style={styles.card}>
                {img ? (
                  <Image
                    source={{ uri: img }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.cardImagePlaceholder}>
                    <Ionicons name="image-outline" size={32} color="#d1d5db" />
                  </View>
                )}

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.name}
                  </Text>

                  {!!item.description && (
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}

                  <View style={styles.cardMeta}>
                    {!!item.time_minutes && (
                      <View style={styles.metaChip}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#6b7280"
                        />
                        <Text style={styles.metaText}>
                          {item.time_minutes}p
                        </Text>
                      </View>
                    )}
                    {!!item.servings && (
                      <View style={styles.metaChip}>
                        <Ionicons
                          name="people-outline"
                          size={14}
                          color="#6b7280"
                        />
                        <Text style={styles.metaText}>{item.servings}</Text>
                      </View>
                    )}
                    {!!item.diet && (
                      <View style={styles.metaChip}>
                        <Ionicons
                          name={
                            item.diet === 'veg'
                              ? 'leaf-outline'
                              : 'restaurant-outline'
                          }
                          size={14}
                          color={item.diet === 'veg' ? '#059669' : '#dc2626'}
                        />
                        <Text
                          style={[
                            styles.metaText,
                            {
                              color:
                                item.diet === 'veg' ? '#059669' : '#dc2626',
                            },
                          ]}
                        >
                          {item.diet === 'veg' ? 'Chay' : 'Mặn'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <FavoriteButton
                    dish={item}
                    mode="pill"
                    stopNavigation
                    style={styles.favBtn}
                  />
                </View>
              </Pressable>
            </Link>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>
              {submittedQ ? 'Không tìm thấy món phù hợp' : 'Chưa có món nào'}
            </Text>
            <Text style={styles.emptySub}>
              Hãy thử lại hoặc thay đổi bộ lọc
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
    color: '#111827',
  },
  errorSub: { color: '#6b7280', marginTop: 8, textAlign: 'center' },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  retryBtnText: { color: '#fff', fontWeight: '700' },

  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  headerContainer: { paddingTop: 8, paddingBottom: 12 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchToggleText: { color: '#9ca3af', fontSize: 15 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  searchInput: { flex: 1, paddingVertical: 6, fontSize: 15, color: '#111827' },
  clearBtn: { padding: 4 },
  cancelBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  cancelBtnText: { color: '#2563EB', fontWeight: '600' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eef2ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: { flex: 1, fontWeight: '700', color: '#1e3a8a', fontSize: 15 },
  sectionBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sectionBadgeText: { color: '#fff', fontWeight: '700', fontSize: 11 },

  card: {
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardImage: { width: '100%', height: 180 },
  cardImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 14 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 20,
  },
  cardDesc: { color: '#6b7280', marginTop: 6, lineHeight: 18, fontSize: 13 },
  cardMeta: { flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  favBtn: { marginTop: 12 },

  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
  },
  emptySub: { color: '#9ca3af', marginTop: 6, fontSize: 13 },
});
