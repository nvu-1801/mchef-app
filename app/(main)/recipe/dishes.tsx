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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router'; // 👈 dùng Link để navigate
import { useListDishesQuery } from '@/src/api/dishesApi';
import { useAppDispatch, useAppSelector } from '@/src/hooks/hooks';
import { toggleFavorite } from '@/src/features/favorites/favoritesSlice';
import { FavoriteButton } from '@/src/components/common/FavoriteButton';
import type { Dish } from '@/src/api/dishesApi';

type Section = { title: string; data: Dish[] };

export default function DishesScreen() {
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
  } = useListDishesQuery(submittedQ ? { q: submittedQ } : undefined);

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

  if (isLoading) return <ActivityIndicator style={{ marginTop: 24 }} />;

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ marginBottom: 8 }}>Không thể tải dữ liệu.</Text>
        <Pressable
          onPress={() => refetch()}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            alignSelf: 'flex-start',
          }}
        >
          <Text>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled
      contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
          {!showSearch ? (
            <Pressable
              onPress={() => setShowSearch(true)}
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                gap: 8,
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 12,
                borderWidth: 1,
              }}
            >
              <Ionicons name="search" size={18} />
              <Text>Tìm món ăn</Text>
            </Pressable>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 10,
                height: 44,
                gap: 8,
              }}
            >
              <Ionicons name="search" size={18} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Nhập từ khoá (vd: pho, bun...)"
                style={{ flex: 1, paddingVertical: 8 }}
                returnKeyType="search"
                onSubmitEditing={onSubmitSearch}
                autoFocus
              />
              {q.length > 0 ? (
                <Pressable
                  onPress={() => setQ('')}
                  style={{ padding: 6, borderRadius: 8 }}
                >
                  <Ionicons name="close" size={18} />
                </Pressable>
              ) : null}
              <Pressable
                onPress={onSubmitSearch}
                style={{ paddingVertical: 8, paddingHorizontal: 10 }}
              >
                <Text style={{ fontWeight: '600' }}>Search</Text>
              </Pressable>
              <Pressable
                onPress={onCancelSearch}
                style={{ paddingVertical: 8, paddingHorizontal: 10 }}
              >
                <Text>Huỷ</Text>
              </Pressable>
            </View>
          )}
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View
          style={{
            backgroundColor: '#F5F5F5',
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 8,
            marginTop: 8,
            marginBottom: 6,
          }}
        >
          <Text style={{ fontWeight: '700' }}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => {
        const img = item.images?.[0];

        return (
          <Link
            href={{ pathname: '/recipe/[id]', params: { id: item.id } }}
            asChild
          >
            <Pressable
              style={{
                marginBottom: 12,
                padding: 12,
                borderWidth: 1,
                borderRadius: 12,
                backgroundColor: 'white',
              }}
            >
              {img ? (
                <Image
                  source={{ uri: img }}
                  style={{
                    width: '100%',
                    height: 180,
                    borderRadius: 10,
                    marginBottom: 8,
                  }}
                  resizeMode="cover"
                />
              ) : null}

              <Text style={{ fontWeight: '700', fontSize: 16 }}>
                {item.name}
              </Text>

              {!!item.description && (
                <Text style={{ opacity: 0.8, marginTop: 6 }} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {!!item.time_minutes && (
                  <Text style={{ fontSize: 12, opacity: 0.7 }}>
                    ⏱ {item.time_minutes} phút
                  </Text>
                )}
                {!!item.servings && (
                  <Text style={{ fontSize: 12, opacity: 0.7 }}>
                    🍽 {item.servings} suất
                  </Text>
                )}
                {!!item.diet && (
                  <Text style={{ fontSize: 12, opacity: 0.7 }}>
                    {item.diet === 'veg' ? '🥗 Chay' : '🍖 Mặn'}
                  </Text>
                )}
              </View>
              <FavoriteButton
                dish={item}
                mode="pill"
                stopNavigation // nếu button nằm trong card bọc <Link asChild>
                style={{ marginTop: 10 }}
              />
            </Pressable>
          </Link>
        );
      }}
      ListEmptyComponent={
        <Text style={{ padding: 16 }}>
          {submittedQ ? 'Không tìm thấy món phù hợp.' : 'Không có món nào.'}
        </Text>
      }
    />
  );
}
