import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';

import { useListDishesQuery, useDeleteDishMutation } from '@/src/api/dishesApi';
import type { Dish } from '@/src/api/dishesApi';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';

export default function ChefDishesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const { data = [], isLoading, isFetching, refetch } = useListDishesQuery();
  const [deleteDish] = useDeleteDishMutation();

  // Get current user ID from Supabase session
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: sessionData } = await supabaseNative.auth.getSession();
        if (mounted && sessionData?.session?.user?.id) {
          setCurrentUserId(sessionData.session.user.id);
        }
      } catch (e) {
        console.log('[ChefDishes] Error getting user:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const myDishes = React.useMemo(() => {
    if (!Array.isArray(data) || !currentUserId) return [];
    return data.filter((d: unknown) => {
      const o = d as unknown as Record<string, unknown>;
      return o.created_by === currentUserId;
    });
  }, [data, currentUserId]) as Dish[];

  const handleDelete = (id?: string) => {
    if (!id) return;
    Alert.alert('Xoá công thức', 'Bạn có chắc muốn xoá công thức này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDish(id).unwrap();
            refetch();
          } catch (e) {
            Alert.alert('Lỗi', 'Không thể xoá, thử lại sau');
          }
        },
      },
    ]);
  };

  if (isLoading || !currentUserId) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Quản lý công thức</Text>
          <Text style={styles.title}>My Dishes</Text>
        </View>

        <View style={styles.headerActions}>
          <Link href="/(main)/chef/new" asChild>
            <Pressable style={styles.addBtn}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>New</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <FlatList
        data={myDishes}
        keyExtractor={(i) => (i?.id ?? Math.random()).toString()}
        contentContainerStyle={styles.list}
        refreshing={isFetching}
        onRefresh={() => refetch()}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Chưa có công thức</Text>
            <Text style={styles.emptySub}>
              Nhấn New để tạo công thức đầu tiên
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const dish = item as unknown as Record<string, unknown>;
          const cover = dish.cover_image_url as string | undefined;
          const images = dish.images as string[] | undefined;
          const coverImage = cover || images?.[0];

          return (
            <View style={styles.card}>
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.cover} />
              ) : (
                <View style={[styles.cover, styles.coverPlaceholder]}>
                  <Ionicons name="image" size={32} color="#cbd5e1" />
                </View>
              )}

              <View style={styles.cardBody}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {(dish.title || dish.name) as string}
                  </Text>
                  <View style={styles.metaRow}>
                    <Feather name="clock" size={14} color="#6b7280" />
                    <Text style={styles.metaText}>
                      {String(dish.time_minutes ?? '-')} phút
                    </Text>
                    <Feather
                      name="users"
                      size={14}
                      color="#6b7280"
                      style={{ marginLeft: 10 }}
                    />
                    <Text style={styles.metaText}>
                      {String(dish.servings ?? '-')} suất
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    onPress={() => router.push(`/(main)/chef/${item.id}`)}
                    style={styles.actionBtn}
                  >
                    <Feather name="edit-2" size={16} color="#065f46" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(item.id)}
                    style={styles.actionBtn}
                  >
                    <Feather name="trash-2" size={16} color="#dc2626" />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7faf9' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: { color: '#6b7280', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: '#052e16', marginTop: 2 },

  headerActions: { flexDirection: 'row', alignItems: 'center' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8 },

  list: { paddingHorizontal: 16, paddingBottom: 32 },

  card: {
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e6eef0',
    flexDirection: 'row',
  },
  cover: { width: 120, height: 100 },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  cardBody: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: { fontWeight: '800', color: '#0b3b20' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaText: { color: '#6b7280', marginLeft: 6, fontWeight: '600' },

  actions: { flexDirection: 'row', marginLeft: 12 },
  actionBtn: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8faf8',
  },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: 12 },
  emptySub: { color: '#9aa4ad', marginTop: 6 },
});
