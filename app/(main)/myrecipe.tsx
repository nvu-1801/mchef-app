import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useDeleteDishMutation,
  useCreateDishMutation,
  useUpdateDishMutation,
} from '@/src/api/dishesApi';
import { useMyDishes } from '@/src/hooks/useMyDishes';
import { useAuth } from '@/src/hooks/useAuth';
import {
  StatsCard,
  RecipeCard,
  EmptyState,
  RecipeCrudModal,
} from '@/src/components/myrecipe';
import type { Dish, DishInput, Diet } from '@/src/types/dish';
import type {
  RecipeForm as RecipeFormModal,
  RecipeStepInput,
  IngredientInput,
} from '@/src/components/myrecipe/RecipeCrudModal';
import { useUserRole } from '@/src/hooks/useUserRole';

const PAGE_SIZE = 10; // ⬅️ số item mỗi trang

export default function MyRecipeScreen() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { myDishes, drafts, published, isLoading, refetch } = useMyDishes();

  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialForm, setInitialForm] = useState<Partial<RecipeFormModal>>({});

  const [deleteDish] = useDeleteDishMutation();
  const [createDish] = useCreateDishMutation();
  const [updateDish] = useUpdateDishMutation();

  // ===== Pagination state =====
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { role, canManage, loading: roleLoading } = useUserRole();

  React.useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // if (authLoading || isLoading || roleLoading) {
  //   return (
  //     <SafeAreaView style={styles.safe}>
  //       <View style={styles.center}>
  //         <ActivityIndicator size="large" color="#16a34a" />
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

   const checkAuthAndPerm = () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please login to continue', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.replace('/(auth)/sign-in') },
      ]);
      return false;
    }
    if (!canManage) {
      Alert.alert('Permission denied', 'Only chef or admin can manage recipes.');
      return false;
    }
    return true;
  };

  function stripVN(s: string) {
    return s
      .normalize?.('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  }

  // Lọc theo searchQuery (tiêu đề, mô tả, category, diet)
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return myDishes;
    const q = stripVN(searchQuery.trim());
    return myDishes.filter((d) => {
      const name = stripVN(d.name ?? '');
      const desc = stripVN(d.description ?? '');
      const cat = stripVN(d.category?.name ?? '');
      const diet = stripVN(String(d.diet ?? ''));
      return (
        name.includes(q) ||
        desc.includes(q) ||
        cat.includes(q) ||
        diet.includes(q)
      );
    });
  }, [myDishes, searchQuery]);

  const visibleData = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page],
  );

  const total = filtered.length;
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasMore = page < maxPage;

  const loadMore = () => {
    if (!hasMore || isLoading) return;
    setPage((p) => p + 1);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setPage(1);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const stats = useMemo(
    () => [
      {
        label: 'Published',
        value: published.length,
        trend: `${myDishes.length} total`,
        icon: 'checkmark-circle-outline' as const,
        iconColor: '#16a34a',
      },
      {
        label: 'Drafts',
        value: drafts.length,
        trend: drafts.length > 0 ? 'Finish them' : 'All done',
        icon: 'document-text-outline' as const,
        iconColor: '#f59e0b',
      },
      {
        label: 'Total Recipes',
        value: myDishes.length,
        trend: 'Your creations',
        icon: 'restaurant-outline' as const,
        iconColor: '#6366f1',
      },
    ],
    [myDishes.length, drafts.length, published.length],
  );

  // ====== Check Auth Helper (chuẩn hoá route login) ======
  const checkAuth = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please login to create or edit recipes',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => router.replace('/(auth)/sign-in'),
          },
        ],
      );
      return false;
    }
    return true;
  };

  const openCreate = () => {
    if (!checkAuth()) return;
    setMode('create');
    setEditingId(null);
    setInitialForm({
      title: '',
      summary: '',
      cover_image_url: '',
      category_id: '',
      servings: null,
      time_minutes: null,
      diet: null,
      published: false,
    });
    setModalVisible(true);
  };

  const openEdit = (id: string) => {
    if (!checkAuth()) return;
    const dish = myDishes.find((d) => d.id === id);
    if (!dish) return;
    setMode('edit');
    setEditingId(id);
    setInitialForm({
      title: dish.name ?? '',
      summary: dish.description ?? '',
      cover_image_url: dish.images?.[0] ?? '',
      category_id: dish.category?.id ?? '',
      servings: dish.servings ?? null,
      time_minutes: dish.time_minutes ?? null,
      diet: (dish.diet as Diet | null) ?? null,
      published: dish.published ?? false,
    });
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleDelete = (id: string) => {
    if (!checkAuth()) return;
    Alert.alert(
      'Delete recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDish(id).unwrap();
              await refetch();
              setPage(1); // reset trang sau khi xoá
            } catch (e: any) {
              console.error('[MyRecipe] Delete error:', e);
              if (e.originalStatus === 401 || e.status === 401) {
                Alert.alert('Session Expired', 'Please login again', [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/(auth)/sign-in'),
                  },
                ]);
              } else {
                Alert.alert('Error', 'Failed to delete recipe');
              }
            }
          },
        },
      ],
    );
  };

  const handleSubmitModal = async (values: RecipeFormModal) => {
    if (!checkAuth()) return;

    // Map từ form sang payload backend
    const payload: DishInput = {
      title: values.title.trim(),
      description: values.summary?.trim() ?? '',
      cover_image_url: values.cover_image_url?.trim() ?? '',
      category_id: values.category_id || undefined,
      servings: values.servings ?? undefined,
      time_minutes: values.time_minutes ?? undefined,
      diet: values.diet ?? undefined,
      ingredients:
        values.dish_ingredients
          ?.map((i) => i.ingredient.trim())
          .filter((t) => t.length > 0) ?? [],
      instructions:
        values.recipe_steps
          ?.map((s) => s.content.trim())
          .filter((t) => t.length > 0) ?? [],
      status: values.published ? 'published' : 'draft',
    };

    try {
      if (mode === 'create') {
        await createDish(payload).unwrap();
      } else if (mode === 'edit' && editingId) {
        await updateDish({ id: editingId, data: payload }).unwrap();
      }

      await refetch();
      setPage(1);
      closeModal();
    } catch (e: any) {
      console.error('[MyRecipe] Submit error:', e);

      if (e.originalStatus === 401 || e.status === 401) {
        Alert.alert('Session Expired', 'Please login again', [
          { text: 'OK', onPress: () => router.replace('/(main)/myrecipe') },
        ]);
      } else {
        Alert.alert('Error', e?.data?.message ?? e?.message ?? 'Submit failed');
      }
    }
  };

  const handleDeleteFromModal = async () => {
    if (!editingId || !checkAuth()) return;
    try {
      await deleteDish(editingId).unwrap();
      await refetch();
      setPage(1);
      closeModal();
    } catch (e: any) {
      console.error('[MyRecipe] Delete error:', e);
      if (e.originalStatus === 401 || e.status === 401) {
        Alert.alert('Session Expired', 'Please login again', [
          { text: 'OK', onPress: () => router.replace('/(auth)/sign-in') },
        ]);
      } else {
        Alert.alert('Error', e?.data?.message ?? e?.message ?? 'Delete failed');
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.authIcon}>
            <Feather name="lock" size={48} color="#16a34a" />
          </View>
          <Text style={styles.authTitle}>Login Required</Text>
          <Text style={styles.authHint}>
            Please login to create and manage your recipes
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.replace('/(auth)/sign-in')}
          >
            <Feather name="log-in" size={18} color="#fff" />
            <Text style={styles.loginText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList<Dish>
        data={visibleData} // ⬅️ dùng data đã phân trang
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReachedThreshold={0.3}
        onEndReached={loadMore}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>Creator hub</Text>
                <Text style={styles.headerTitle}>My recipes</Text>
              </View>

              <View style={styles.headerActionsRow}>
                <TouchableOpacity
                  style={styles.headerBtn}
                  onPress={() => router.push('/(main)/profile')}
                >
                  <Feather name="user" size={18} color="#16a34a" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} onPress={openCreate}>
                  <Feather name="plus" size={18} color="#16a34a" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsRow}
            >
              {stats.map((s) => (
                <StatsCard key={s.label} {...s} />
              ))}
            </ScrollView>
            {/* Search bar */}
            <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
              <View style={styles.searchWrap}>
                <Feather name="search" size={18} color="#6b7280" />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search my recipes…"
                  placeholderTextColor="#9aa3b2"
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Feather name="x" size={18} color="#6b7280" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Manage recipes</Text>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const cover = item.images?.[0] ?? 'https://picsum.photos/400/300';
          const title = item.name ?? '';
          const summary = item.description ?? '';
          const isPublished = item.published ?? false;
          const updatedAt = isPublished
            ? item.created_at
              ? `Published ${formatRelativeTime(item.created_at)}`
              : 'Published'
            : item.updated_at
              ? `Edited ${formatRelativeTime(item.updated_at)}`
              : 'Draft';

          return (
            <RecipeCard
              id={item.id}
              title={title}
              summary={summary}
              cover={cover}
              updatedAt={updatedAt}
              published={isPublished}
              category={item.category ?? null}
              servings={item.servings ?? null}
              time_minutes={item.time_minutes ?? null}
              diet={item.diet ?? null}
              onDelete={handleDelete}
              onEdit={openEdit}
            />
          );
        }}
        ListEmptyComponent={
          searchQuery ? (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Text style={{ color: '#6b7280' }}>
                No results for “{searchQuery}”.
              </Text>
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={{ marginTop: 8 }}
              >
                <Text style={{ color: '#16a34a', fontWeight: '600' }}>
                  Clear search
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <EmptyState />
          )
        }
        ListFooterComponent={
          total > 0 ? (
            hasMore ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#16a34a" />
                <Text style={{ marginTop: 8, color: '#6b7280' }}>
                  Loading more…
                </Text>
              </View>
            ) : (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: '#9aa3b2' }}>— No more recipes —</Text>
              </View>
            )
          ) : null
        }
      />

      <RecipeCrudModal
        visible={modalVisible}
        mode={mode}
        initial={initialForm}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
        onDelete={mode === 'edit' ? handleDeleteFromModal : undefined}
        titleText={mode === 'create' ? 'Create Recipe' : 'Edit Recipe'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0fdf4' },
  container: { paddingBottom: 56, paddingTop: 8 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  eyebrow: { fontSize: 13, fontWeight: '500', color: '#98a1b3' },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2c2c2c',
    marginTop: 2,
  },
  headerActionsRow: { flexDirection: 'row', gap: 10 },

  statsRow: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 },

  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2c2c2c' },
  linkText: { color: '#16a34a', fontWeight: '600' },

  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Auth styles
  authIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  authHint: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 28,
    gap: 10,
    shadowColor: '#16a34a',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
});

// Helper function
function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return `${months}mo ago`;
}
