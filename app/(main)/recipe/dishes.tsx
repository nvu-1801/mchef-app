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
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useListDishesQuery } from '@/src/api/dishesApi';
import { FavoriteButton } from '@/src/components/common/FavoriteButton';
import type { Dish } from '@/src/types/dish';

type Section = { title: string; data: Dish[] };

export default function DishesScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ diet?: string }>();
  const topInset =
    insets.top ||
    (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0);
  const bottomInset = insets.bottom ?? 0;

  const [showSearch, setShowSearch] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [submittedQ, setSubmittedQ] = React.useState<string | undefined>(
    undefined,
  );
  const [selectedDiet, setSelectedDiet] = React.useState<string | undefined>(
    params.diet,
  );

  const {
    data = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useListDishesQuery();

  // Filter by diet
  const filteredByDiet = React.useMemo(() => {
    if (!selectedDiet) return data;
    return data.filter((d) => d.diet === selectedDiet);
  }, [data, selectedDiet]);

  const sections: Section[] = React.useMemo(() => {
    if (!filteredByDiet?.length) return [];
    const byCat = new Map<string, Dish[]>();
    for (const d of filteredByDiet) {
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
  }, [filteredByDiet]);

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
      <SafeAreaView style={[styles.safe, { paddingTop: topInset }]}>
        <LinearGradient
          colors={['#f0fdf4', '#ffffff']}
          style={styles.gradientBg}
        >
          <View style={styles.centerContainer}>
            <View style={styles.loadingCircle}>
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
            <Text style={styles.loadingText}>Đang tải công thức...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: topInset }]}>
        <LinearGradient
          colors={['#fef2f2', '#ffffff']}
          style={styles.gradientBg}
        >
          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Ionicons name="alert-circle-outline" size={56} color="#ef4444" />
            </View>
            <Text style={styles.errorTitle}>Không thể tải danh sách</Text>
            <Text style={styles.errorSub}>
              Vui lòng kiểm tra kết nối và thử lại
            </Text>
            <TouchableOpacity onPress={() => refetch()} activeOpacity={0.8}>
              <LinearGradient
                colors={['#16a34a', '#15803d']}
                style={styles.retryBtn}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const getHeaderTitle = () => {
    if (selectedDiet === 'veg') return 'Món chay';
    if (selectedDiet === 'nonveg') return 'Món mặn';
    return 'Tất cả công thức';
  };

  const getHeaderIcon = () => {
    if (selectedDiet === 'veg')
      return <MaterialCommunityIcons name="leaf" size={24} color="#10b981" />;
    if (selectedDiet === 'nonveg')
      return <Ionicons name="restaurant" size={24} color="#ef4444" />;
    return null;
  };

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
            tintColor="#16a34a"
            colors={['#16a34a']}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={['#f0fdf4', '#ffffff']}
              style={styles.headerGradient}
            >
              <View style={styles.topBar}>
                <View style={styles.titleContainer}>
                  <Text style={styles.eyebrow}>KHÁM PHÁ</Text>
                  <View style={styles.titleRow}>
                    {getHeaderIcon()}
                    <Text style={styles.mainTitle}>{getHeaderTitle()}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#dcfce7', '#f0fdf4']}
                    style={styles.filterGradient}
                  >
                    <Feather name="sliders" size={20} color="#16a34a" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Diet Filter Pills */}
              <View style={styles.dietFilters}>
                <TouchableOpacity
                  onPress={() => setSelectedDiet(undefined)}
                  activeOpacity={0.8}
                >
                  {!selectedDiet ? (
                    <LinearGradient
                      colors={['#16a34a', '#15803d']}
                      style={styles.dietPillActive}
                    >
                      <Ionicons name="apps" size={16} color="#fff" />
                      <Text style={styles.dietPillTextActive}>Tất cả</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.dietPillInactive}>
                      <Ionicons name="apps" size={16} color="#6b7280" />
                      <Text style={styles.dietPillTextInactive}>Tất cả</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedDiet('veg')}
                  activeOpacity={0.8}
                >
                  {selectedDiet === 'veg' ? (
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      style={styles.dietPillActive}
                    >
                      <MaterialCommunityIcons
                        name="leaf"
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.dietPillTextActive}>Món chay</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.dietPillInactive}>
                      <MaterialCommunityIcons
                        name="leaf"
                        size={16}
                        color="#6b7280"
                      />
                      <Text style={styles.dietPillTextInactive}>Món chay</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedDiet('nonveg')}
                  activeOpacity={0.8}
                >
                  {selectedDiet === 'nonveg' ? (
                    <LinearGradient
                      colors={['#ef4444', '#dc2626']}
                      style={styles.dietPillActive}
                    >
                      <Ionicons name="restaurant" size={16} color="#fff" />
                      <Text style={styles.dietPillTextActive}>Món mặn</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.dietPillInactive}>
                      <Ionicons name="restaurant" size={16} color="#6b7280" />
                      <Text style={styles.dietPillTextInactive}>Món mặn</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {!showSearch ? (
                <TouchableOpacity
                  onPress={() => setShowSearch(true)}
                  style={styles.searchToggle}
                  activeOpacity={0.7}
                >
                  <View style={styles.searchIconBg}>
                    <Ionicons name="search" size={20} color="#16a34a" />
                  </View>
                  <Text style={styles.searchToggleText}>
                    Tìm món ăn, nguyên liệu...
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </TouchableOpacity>
              ) : (
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={20} color="#16a34a" />
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
                    <TouchableOpacity
                      onPress={() => setQ('')}
                      style={styles.clearBtn}
                    >
                      <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={onCancelSearch}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>Huỷ</Text>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <LinearGradient
            colors={['#dcfce7', '#f0fdf4']}
            style={styles.sectionHeader}
          >
            <View style={styles.sectionIconBg}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={16}
                color="#fff"
              />
            </View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{section.data.length}</Text>
            </View>
          </LinearGradient>
        )}
        renderItem={({ item }) => {
          const img = item.images?.[0];
          return (
            <Link
              href={{ pathname: '/recipe/[id]', params: { id: item.id } }}
              asChild
            >
              <TouchableOpacity style={styles.card} activeOpacity={0.9}>
                {img ? (
                  <>
                    <Image
                      source={{ uri: img }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.3)']}
                      style={styles.cardGradient}
                    />
                  </>
                ) : (
                  <LinearGradient
                    colors={['#f3f4f6', '#e5e7eb']}
                    style={styles.cardImagePlaceholder}
                  >
                    <Ionicons name="image-outline" size={40} color="#9ca3af" />
                  </LinearGradient>
                )}

                {/* Diet Badge */}
                {item.diet && (
                  <View style={styles.dietBadgeContainer}>
                    {item.diet === 'veg' ? (
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={styles.dietBadge}
                      >
                        <MaterialCommunityIcons
                          name="leaf"
                          size={14}
                          color="#fff"
                        />
                      </LinearGradient>
                    ) : (
                      <LinearGradient
                        colors={['#ef4444', '#dc2626']}
                        style={styles.dietBadge}
                      >
                        <Ionicons name="restaurant" size={14} color="#fff" />
                      </LinearGradient>
                    )}
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
                        <Text style={styles.metaText}>
                          {item.servings} người
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
              </TouchableOpacity>
            </Link>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#f0fdf4', '#dcfce7']}
              style={styles.emptyIcon}
            >
              <Ionicons name="restaurant-outline" size={56} color="#16a34a" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>
              {submittedQ
                ? 'Không tìm thấy món phù hợp'
                : selectedDiet
                  ? `Chưa có món ${selectedDiet === 'veg' ? 'chay' : 'mặn'} nào`
                  : 'Chưa có món nào'}
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
  safe: { flex: 1, backgroundColor: '#ffffff' },
  gradientBg: { flex: 1 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Loading
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: { color: '#6b7280', fontSize: 15, fontWeight: '600' },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  errorSub: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  listContent: { paddingHorizontal: 16 },

  // Header
  headerContainer: { marginBottom: 16 },
  headerGradient: {
    paddingTop: 12,
    paddingHorizontal: 4,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6b7280',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  filterBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  filterGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Diet Filters
  dietFilters: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  dietPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  dietPillTextActive: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  dietPillInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dietPillTextInactive: {
    color: '#6b7280',
    fontWeight: '700',
    fontSize: 13,
  },

  // Search
  searchToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  searchIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchToggleText: {
    flex: 1,
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '500',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#16a34a',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 4,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  clearBtn: { padding: 4 },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
  },
  cancelBtnText: { color: '#16a34a', fontWeight: '700', fontSize: 14 },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginTop: 12,
    marginBottom: 10,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontWeight: '800',
    color: '#065f46',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  sectionBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionBadgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  // Card
  card: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardImage: { width: '100%', height: 200 },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dietBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  dietBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  cardBody: { padding: 16 },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  cardDesc: { color: '#6b7280', marginTop: 8, lineHeight: 20, fontSize: 14 },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 12, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metaText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  favBtn: { marginTop: 14 },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptySub: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
