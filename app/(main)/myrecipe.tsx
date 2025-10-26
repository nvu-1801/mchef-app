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
  ScrollView, // chỉ dùng cho thanh Stats ngang
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useDeleteDishMutation,
  useCreateDishMutation,
  useUpdateDishMutation,
} from '@/src/api/dishesApi';
import { useMyDishes } from '@/src/hooks/useMyDishes';
import {
  StatsCard,
  QuickActions,
  RecipeSection,
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
  // useMyDishes trả: myDishes: Dish[], drafts/published: DishCard[]
  const { myDishes, drafts, published, isLoading, refetch } = useMyDishes();

  // ====== Modal state ======
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialForm, setInitialForm] = useState<Partial<RecipeForm>>({});

  // ====== RTK Query mutations ======
  const [deleteDish] = useDeleteDishMutation();
  const [createDish] = useCreateDishMutation();
  const [updateDish] = useUpdateDishMutation();

  // ====== Stats ======
  const stats = useMemo(
    () => [
      {
        label: 'Published',
        value: published.length,
        trend: `${myDishes.length} total`,
        icon: 'checkmark-circle-outline' as const,
        iconColor: '#2ecc71',
      },
      {
        label: 'Drafts',
        value: drafts.length,
        trend: drafts.length > 0 ? 'Finish them' : 'All done',
        icon: 'document-text-outline' as const,
        iconColor: '#f7b500',
      },
      {
        label: 'Total Recipes',
        value: myDishes.length,
        trend: 'Your creations',
        icon: 'restaurant-outline' as const,
        iconColor: '#2d9cdb',
      },
    ],
    [myDishes.length, drafts.length, published.length]
  );

  // ====== Handlers mở/đóng Modal ======
  const openCreate = () => {
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
    const dish: Dish | undefined = myDishes.find((d) => d.id === id);
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
      published: !!dish.published,
    });
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  // ====== CRUD actions ======
  const handleDelete = (id: string) => {
    Alert.alert('Delete recipe', 'Are you sure you want to delete this recipe?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDish(id).unwrap();
            refetch();
          } catch {
            Alert.alert('Error', 'Failed to delete recipe');
          }
        },
      },
    ]);
  };

  const handleSubmitModal = async (values: RecipeForm) => {
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
      Alert.alert('Error', e?.data?.message ?? e?.message ?? 'Submit failed');
    }
  };

  const handleDeleteFromModal = async () => {
    if (!editingId) return;
    try {
      await deleteDish(editingId).unwrap();
      await refetch();
      closeModal();
    } catch (e: any) {
      Alert.alert('Error', e?.data?.message ?? e?.message ?? 'Delete failed');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2d9cdb" />
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
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>Creator hub</Text>
                <Text style={styles.headerTitle}>My recipes</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={styles.headerBtn}
                  onPress={() => router.push('/(main)/profile')}
                >
                  <Feather name="user" size={18} color="#2d9cdb" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} onPress={openCreate}>
                  <Feather name="plus" size={18} color="#2d9cdb" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats (horizontal OK) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsRow}
            >
              {stats.map((stat) => (
                <StatsCard key={stat.label} {...stat} />
              ))}
            </ScrollView>

            {/* Quick Actions */}
            <QuickActions />

            {/* Section header cho Manage */}
            <View style={[styles.section, styles.sectionHeader]}>
              <Text style={styles.sectionTitle}>Manage recipes</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/chef')}>
                <Text style={styles.linkText}>View all</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const cover = item.images?.[0] ?? 'https://picsum.photos/400/300';
          const title = item.name ?? '';
          const summary = item.description ?? '';
          const publishedFlag = !!item.published;
          const updatedAt = publishedFlag
            ? item.created_at
              ? `Published ${formatRelativeTime(item.created_at)}`
              : 'Published'
            : item.updated_at
            ? `Edited ${formatRelativeTime(item.updated_at)}`
            : 'Draft';

          const card: DishCard = {
            id: item.id,
            title,
            summary,
            cover,
            updatedAt,
            published: publishedFlag,
            category: item.category ?? null,
            servings: item.servings ?? null,
            time_minutes: item.time_minutes ?? null,
            diet: item.diet ?? null,
            slug: item.slug,
            created_by: item.created_by ?? null,
          };

          return (
            <View style={{ paddingHorizontal: 20 }}>
              <RecipeSection
                title=""
                recipes={[card]}
                onDelete={handleDelete}
                onEdit={openEdit}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 20 }}>
            <EmptyState />
          </View>
        }
        ListFooterComponent={
          <View>
            {drafts.length > 0 && (
              <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
                <RecipeSection
                  title="Drafts in progress"
                  recipes={drafts}
                  onDelete={handleDelete}
                  onEdit={openEdit}
                />
              </View>
            )}
            {published.length > 0 && (
              <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
                <RecipeSection
                  title="Published"
                  recipes={published}
                  onDelete={handleDelete}
                  onEdit={openEdit}
                />
              </View>
            )}
            <View style={styles.bottomPadding} />
          </View>
        }
      />

      {/* ====== CRUD MODAL ====== */}
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
  safe: { flex: 1, backgroundColor: '#f5f7fa' },
  container: { paddingBottom: 56 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  eyebrow: { fontSize: 13, fontWeight: '500', color: '#98a1b3' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#2c2c2c', marginTop: 2 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e6f3fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6 },
  bottomPadding: { height: 80 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2c2c2c' },
  linkText: { fontSize: 14, fontWeight: '500', color: '#007aff' },
});

// helper
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
