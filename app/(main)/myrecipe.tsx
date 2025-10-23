import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { ComponentProps } from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';
import { useListDishesQuery, useDeleteDishMutation } from '@/src/api/dishesApi';

type IconName = ComponentProps<typeof Ionicons>['name'];
type FeatherIconName = ComponentProps<typeof Feather>['name'];

type RecipeItem = {
  id: string;
  title: string;
  summary: string;
  updatedAt: string;
  cover: string;
  stats: {
    saves: number;
    views: number;
  };
  status?: 'draft' | 'published';
};

const QUICK_ACTIONS: {
  id: string;
  label: string;
  icon: FeatherIconName;
  route: string;
}[] = [
  {
    id: 'action-1',
    label: 'New recipe',
    icon: 'plus',
    route: '/(main)/chef/new',
  },
  { id: 'action-2', label: 'All recipes', icon: 'list', route: '/(main)/chef' },
  { id: 'action-3', label: 'Settings', icon: 'settings', route: '/settings' },
];

export default function MyRecipeScreen() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const { data = [], isLoading, refetch } = useListDishesQuery();
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
        console.log('[MyRecipe] Error getting user:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter dishes by current user
  const myDishes = React.useMemo(() => {
    console.log('[MyRecipe] Filter check:', {
      hasData: Array.isArray(data),
      dataLength: data?.length,
      currentUserId,
    });

    if (!Array.isArray(data) || !currentUserId) return [];

    // Log first dish to see structure
    if (data.length > 0) {
      const sample = data[0] as unknown as Record<string, unknown>;
      console.log('[MyRecipe] Sample dish structure:', {
        id: sample.id,
        name: sample.name,
        created_by: sample.created_by,
        creator_id: sample.creator_id,
        author_id: sample.author_id,
        user_id: sample.user_id,
      });
    }

    const filtered = data.filter((d) => {
      const dish = d as unknown as Record<string, unknown>;
      const match = dish.created_by === currentUserId;

      // Log each comparison
      if (data.indexOf(d) < 3) {
        // Only log first 3 to avoid spam
        console.log('[MyRecipe] Checking dish:', {
          dishId: dish.id,
          created_by: dish.created_by,
          currentUserId,
          match,
        });
      }

      return match;
    });

    console.log('[MyRecipe] Filter result:', {
      total: data.length,
      filtered: filtered.length,
    });

    return filtered;
  }, [data, currentUserId]);

  console.log('[MyRecipe] myDishes:', myDishes.length);

  // Separate drafts and published
  const drafts = React.useMemo(() => {
    return myDishes
      .filter((d) => {
        const dish = d as unknown as Record<string, unknown>;
        // Consider draft if explicitly marked OR if published_at is missing
        const isDraft = dish.status === 'draft' || !dish.published_at;

        if (myDishes.indexOf(d) < 2) {
          console.log('[MyRecipe] Draft check:', {
            id: dish.id,
            status: dish.status,
            published_at: dish.published_at,
            isDraft,
          });
        }

        return isDraft;
      })
      .slice(0, 5)
      .map((d) => {
        const dish = d as unknown as Record<string, unknown>;
        return {
          id: dish.id as string,
          title: (dish.name ?? dish.title) as string,
          summary: (dish.description ?? '') as string,
          updatedAt: dish.updated_at
            ? `Edited ${formatRelativeTime(dish.updated_at as string)}`
            : 'Draft',
          cover:
            (dish.images as string[])?.[0] ?? 'https://picsum.photos/400/300',
          stats: {
            saves: 0,
            views: (dish.view_count ?? 0) as number,
          },
          status: 'draft' as const,
        };
      });
  }, [myDishes]);

  const published = React.useMemo(() => {
    return myDishes
      .filter((d) => {
        const dish = d as unknown as Record<string, unknown>;
        // Consider published if explicitly marked OR if published_at exists
        const isPublished = dish.status === 'published' || !!dish.published_at;

        if (myDishes.indexOf(d) < 2) {
          console.log('[MyRecipe] Published check:', {
            id: dish.id,
            status: dish.status,
            published_at: dish.published_at,
            isPublished,
          });
        }

        return isPublished;
      })
      .slice(0, 5)
      .map((d) => {
        const dish = d as unknown as Record<string, unknown>;
        return {
          id: dish.id as string,
          title: (dish.name ?? dish.title) as string,
          summary: (dish.description ?? '') as string,
          updatedAt: dish.published_at
            ? `Published ${formatRelativeTime(dish.published_at as string)}`
            : 'Published',
          cover:
            (dish.images as string[])?.[0] ?? 'https://picsum.photos/400/300',
          stats: {
            saves: (dish.favorite_count ?? 0) as number,
            views: (dish.view_count ?? 0) as number,
          },
          status: 'published' as const,
        };
      });
  }, [myDishes]);

  const stats = React.useMemo(
    () => [
      {
        id: 'published',
        label: 'Published',
        value: published.length,
        trend: `${myDishes.length} total`,
        icon: 'checkmark-circle-outline' as IconName,
        iconColor: '#2ecc71',
      },
      {
        id: 'drafts',
        label: 'Drafts',
        value: drafts.length,
        trend: drafts.length > 0 ? 'Finish them' : 'All done',
        icon: 'document-text-outline' as IconName,
        iconColor: '#f7b500',
      },
      {
        id: 'favorites',
        label: 'Total Saves',
        value: published.reduce((sum, p) => sum + p.stats.saves, 0),
        trend: `${published.reduce((sum, p) => sum + p.stats.views, 0)} views`,
        icon: 'bookmark-outline' as IconName,
        iconColor: '#2d9cdb',
      },
    ],
    [published, drafts, myDishes],
  );

  const handleDelete = (id: string) => {
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
            } catch (e) {
              Alert.alert('Error', 'Failed to delete recipe');
            }
          },
        },
      ],
    );
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
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Creator hub</Text>
            <Text style={styles.headerTitle}>My recipes</Text>
          </View>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/(main)/profile')}
          >
            <Feather name="user" size={18} color="#2d9cdb" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statRow}
        >
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View
                style={[
                  styles.statIconWrap,
                  { backgroundColor: `${stat.iconColor}15` },
                ]}
              >
                <Ionicons name={stat.icon} size={20} color={stat.iconColor} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statTrend}>{stat.trend}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
          </View>
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionCard,
                  index === QUICK_ACTIONS.length - 1 && styles.actionCardLast,
                ]}
                onPress={() => router.push(action.route as any)}
              >
                <Feather name={action.icon} size={20} color="#2d9cdb" />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {drafts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Drafts in progress</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/chef')}>
                <Text style={styles.linkText}>View all</Text>
              </TouchableOpacity>
            </View>
            {drafts.map((draft) => (
              <TouchableOpacity
                key={draft.id}
                style={styles.recipeCard}
                onPress={() => router.push(`/(main)/chef/${draft.id}`)}
              >
                <ImageBackground
                  source={{ uri: draft.cover }}
                  style={styles.recipeCover}
                  imageStyle={styles.recipeCoverImage}
                >
                  <View style={styles.recipeOverlay} />
                </ImageBackground>
                <View style={styles.recipeBody}>
                  <Text style={styles.recipeTitle} numberOfLines={2}>
                    {draft.title}
                  </Text>
                  <Text style={styles.recipeSummary} numberOfLines={2}>
                    {draft.summary}
                  </Text>
                  <View style={styles.recipeMetaRow}>
                    <Ionicons name="pencil-outline" size={14} color="#98a1b3" />
                    <Text style={styles.recipeMeta}>{draft.updatedAt}</Text>
                  </View>
                </View>
                <View style={styles.recipeStats}>
                  <TouchableOpacity
                    style={styles.recipeStatItem}
                    onPress={() => handleDelete(draft.id)}
                  >
                    <Feather name="trash-2" size={16} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {published.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Published</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/chef')}>
                <Text style={styles.linkText}>View all</Text>
              </TouchableOpacity>
            </View>
            {published.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
              >
                <ImageBackground
                  source={{ uri: recipe.cover }}
                  style={styles.recipeCover}
                  imageStyle={styles.recipeCoverImage}
                >
                  <View style={styles.recipeOverlay} />
                </ImageBackground>
                <View style={styles.recipeBody}>
                  <Text style={styles.recipeTitle} numberOfLines={2}>
                    {recipe.title}
                  </Text>
                  <Text style={styles.recipeSummary} numberOfLines={2}>
                    {recipe.summary}
                  </Text>
                  <View style={styles.recipeMetaRow}>
                    <Ionicons name="time-outline" size={14} color="#98a1b3" />
                    <Text style={styles.recipeMeta}>{recipe.updatedAt}</Text>
                  </View>
                </View>
                <View style={styles.recipeStats}>
                  <View style={styles.recipeStatItem}>
                    <Ionicons
                      name="bookmark-outline"
                      size={16}
                      color="#ff7a59"
                    />
                    <Text style={styles.recipeStatText}>
                      {recipe.stats.saves}
                    </Text>
                  </View>
                  <View style={styles.recipeStatItem}>
                    <Ionicons name="eye-outline" size={16} color="#2d9cdb" />
                    <Text style={styles.recipeStatText}>
                      {recipe.stats.views}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.recipeStatItem, { marginTop: 8 }]}
                    onPress={() => router.push(`/(main)/chef/${recipe.id}`)}
                  >
                    <Feather name="edit-2" size={16} color="#2d9cdb" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Show all dishes if no status field exists */}
        {myDishes.length > 0 &&
          drafts.length === 0 &&
          published.length === 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Recipes</Text>
                <TouchableOpacity onPress={() => router.push('/(main)/chef')}>
                  <Text style={styles.linkText}>View all</Text>
                </TouchableOpacity>
              </View>
              {myDishes.slice(0, 5).map((d) => {
                const dish = d as unknown as Record<string, unknown>;
                return (
                  <TouchableOpacity
                    key={dish.id as string}
                    style={styles.recipeCard}
                    onPress={() => router.push(`/recipe/${dish.id}`)}
                  >
                    <ImageBackground
                      source={{
                        uri:
                          (dish.images as string[])?.[0] ??
                          'https://picsum.photos/400/300',
                      }}
                      style={styles.recipeCover}
                      imageStyle={styles.recipeCoverImage}
                    >
                      <View style={styles.recipeOverlay} />
                    </ImageBackground>
                    <View style={styles.recipeBody}>
                      <Text style={styles.recipeTitle} numberOfLines={2}>
                        {(dish.name ?? dish.title) as string}
                      </Text>
                      <Text style={styles.recipeSummary} numberOfLines={2}>
                        {(dish.description ?? '') as string}
                      </Text>
                      <View style={styles.recipeMetaRow}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#98a1b3"
                        />
                        <Text style={styles.recipeMeta}>
                          {`${dish.time_minutes ?? '-'} min`}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.recipeStats}>
                      <TouchableOpacity
                        style={[styles.recipeStatItem, { marginTop: 8 }]}
                        onPress={() => router.push(`/(main)/chef/${dish.id}`)}
                      >
                        <Feather name="edit-2" size={16} color="#2d9cdb" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.recipeStatItem}
                        onPress={() => handleDelete(dish.id as string)}
                      >
                        <Feather name="trash-2" size={16} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

        {myDishes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No recipes yet</Text>
            <Text style={styles.emptySub}>
              Create your first recipe to get started
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/(main)/chef/new')}
            >
              <Text style={styles.emptyBtnText}>Create Recipe</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
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
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2c2c2c',
    marginTop: 2,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e6f3fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6 },
  statCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginRight: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#2c2c2c' },
  statLabel: { marginTop: 4, color: '#52606d', fontWeight: '600' },
  statTrend: { marginTop: 6, color: '#98a1b3', fontSize: 12 },
  section: { marginTop: 26 },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2c2c2c' },
  linkText: { color: '#2d9cdb', fontWeight: '600' },
  quickActions: { flexDirection: 'row', paddingHorizontal: 20 },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginRight: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  actionCardLast: { marginRight: 0 },
  actionLabel: { marginTop: 8, fontWeight: '600', color: '#2c2c2c' },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  recipeCover: {
    width: 96,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 14,
  },
  recipeCoverImage: { borderRadius: 16 },
  recipeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 26, 34, 0.18)',
    borderRadius: 16,
  },
  recipeBody: { flex: 1 },
  recipeTitle: { fontSize: 16, fontWeight: '700', color: '#2c2c2c' },
  recipeSummary: {
    marginTop: 6,
    color: '#52606d',
    fontSize: 13,
    lineHeight: 18,
  },
  recipeMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  recipeMeta: { marginLeft: 6, color: '#98a1b3', fontSize: 12 },
  recipeStats: { marginLeft: 12, alignItems: 'flex-end' },
  recipeStatItem: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  recipeStatText: { marginLeft: 6, color: '#2c2c2c', fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    color: '#2c2c2c',
  },
  emptySub: { color: '#98a1b3', marginTop: 8, textAlign: 'center' },
  emptyBtn: {
    marginTop: 24,
    backgroundColor: '#2d9cdb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  bottomPadding: { height: 80 },
});
