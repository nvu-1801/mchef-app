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
  QuickActions,
  RecipeCard,
  EmptyState,
  RecipeCrudModal,
} from '@/src/components/myrecipe';
import type { Dish, DishCard, DishInput, Diet } from '@/src/types/dish';

// Form dùng trong Modal (UI schema)
type RecipeForm = {
  title: string;
  summary?: string;
  cover?: string;
  category_id?: string;
  servings?: number | null;
  time_minutes?: number | null;
  diet?: Diet | 'nonveg' | null;
  published?: boolean;
};

export default function MyRecipeScreen() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { myDishes, drafts, published, isLoading, refetch } = useMyDishes();

  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialForm, setInitialForm] = useState<Partial<RecipeForm>>({});

  const [deleteDish] = useDeleteDishMutation();
  const [createDish] = useCreateDishMutation();
  const [updateDish] = useUpdateDishMutation();

  console.log('[MyRecipe] Auth status:', {
    isAuthenticated,
    userId: user?.id,
    email: user?.email,
  });

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

  // ====== Check Auth Helper ======
  const checkAuth = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please login to create or edit recipes',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => router.push('/(auth)/login'),
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
      cover: '',
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
      cover: dish.images?.[0] ?? '',
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
              refetch();
            } catch (e: any) {
              console.error('[MyRecipe] Delete error:', e);
              if (e.originalStatus === 401 || e.status === 401) {
                Alert.alert('Session Expired', 'Please login again', [
                  { text: 'OK', onPress: () => router.push('/(auth)/login') },
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

  const handleSubmitModal = async (values: RecipeForm) => {
    if (!checkAuth()) return;

    const payload: DishInput = {
      title: values.title,
      description: values.summary ?? '',
      cover_image_url: values.cover ?? '',
      category_id: values.category_id || undefined,
      servings: values.servings ?? undefined,
      time_minutes: values.time_minutes ?? undefined,
      diet: values.diet ?? undefined,
      status: values.published ? 'published' : 'draft',
    };

    try {
      if (mode === 'create') {
        await createDish(payload).unwrap();
      } else if (mode === 'edit' && editingId) {
        await updateDish({ id: editingId, data: payload }).unwrap();
      }
      await refetch();
      closeModal();
    } catch (e: any) {
      console.error('[MyRecipe] Submit error:', e);
      if (e.originalStatus === 401 || e.status === 401) {
        Alert.alert('Session Expired', 'Please login again', [
          { text: 'OK', onPress: () => router.push('/(auth)/login') },
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
      closeModal();
    } catch (e: any) {
      console.error('[MyRecipe] Delete error:', e);
      if (e.originalStatus === 401 || e.status === 401) {
        Alert.alert('Session Expired', 'Please login again', [
          { text: 'OK', onPress: () => router.push('/(auth)/login') },
        ]);
      } else {
        Alert.alert('Error', e?.data?.message ?? e?.message ?? 'Delete failed');
      }
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  // Not authenticated
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
            onPress={() => router.push('/(auth)/sign-in')}
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
        data={myDishes}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
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

            <QuickActions />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Manage recipes</Text>
              <TouchableOpacity
                onPress={() => router.push('/(main)/chef?mine=1')}
              >
                <Text style={styles.linkText}>View all</Text>
              </TouchableOpacity>
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
        ListEmptyComponent={<EmptyState />}
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
