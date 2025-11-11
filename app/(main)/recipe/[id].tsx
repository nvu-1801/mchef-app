// app/(main)/dishes/[id].tsx
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
  Pressable,
  Share,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import { useGetDishQuery } from '@/src/api/dishesApi';
import { FavoriteButton } from '@/src/components/common/FavoriteButton';

function Chip({
  icon,
  label,
  tone = 'primary',
}: {
  icon?: React.ReactNode;
  label: string;
  tone?: 'primary' | 'success' | 'warning' | 'neutral';
}) {
  const palette: Record<string, { bg: string; text: string; border: string }> =
    {
      primary: { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' },
      success: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
      warning: { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
      neutral: { bg: '#F5F5F5', text: '#374151', border: '#E5E7EB' },
    };
  const c = palette[tone] ?? palette.primary;

  return (
    <View
      style={[styles.chip, { backgroundColor: c.bg, borderColor: c.border }]}
    >
      {icon}
      <Text style={[styles.chipText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    // youtu.be/<id>
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    // youtube.com/watch?v=...
    if (host.endsWith('youtube.com')) {
      const path = u.pathname;
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      // shorts/<id> hoặc embed/<id>
      const parts = path.split('/').filter(Boolean);
      const idx = parts.findIndex((p) => p === 'shorts' || p === 'embed');
      if (idx >= 0 && parts[idx + 1]) {
        return `https://www.youtube.com/embed/${parts[idx + 1]}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function VideoBlock({ url, poster }: { url: string; poster?: string }) {
  const yt = toYouTubeEmbed(url);

  if (yt) {
    // YouTube: nhúng iframe qua WebView
    const html = `
      <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>html,body{margin:0;padding:0;background:#000;height:100%} .wrap{position:fixed;inset:0}</style>
      </head><body>
        <div class="wrap">
          <iframe
            width="100%" height="100%" src="${yt}"
            title="YouTube video player" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>
      </body></html>
    `;
    return (
      <View style={styles.videoContainer}>
        <WebView
          source={{ html }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
        />
      </View>
    );
  }

  // File trực tiếp (mp4/m3u8…)
  return (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: url }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        style={styles.video}
        posterSource={poster ? { uri: poster } : undefined}
        posterStyle={{ width: '100%', height: '100%' }}
        shouldPlay={false}
        isLooping={false}
      />
    </View>
  );
}

function SectionHeader({
  title,
  icon,
}: {
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    </View>
  );
}

function Card({
  title,
  children,
  tone = 'primary',
}: {
  title: string;
  children: React.ReactNode;
  tone?: 'primary' | 'success' | 'warning' | 'neutral';
}) {
  const borderByTone: Record<string, string> = {
    primary: '#E0E7FF',
    success: '#A7F3D0',
    warning: '#FED7AA',
    neutral: '#E5E7EB',
  };
  const headerColorByTone: Record<string, string> = {
    primary: '#3730A3',
    success: '#065F46',
    warning: '#9A3412',
    neutral: '#374151',
  };

  return (
    <View style={[styles.card, { borderColor: borderByTone[tone] }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: headerColorByTone[tone] }]}>
          {title}
        </Text>
      </View>
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
}

function ActionBtn({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionBtn}>
      {icon}
      <Text style={styles.actionBtnText}>{label}</Text>
    </Pressable>
  );
}

type Rating = {
  stars: number;
  comment?: string;
  user_id?: string;
  created_at?: string;
};

type Ingredient = {
  amount?: number;
  note?: string;
  ingredient?: string;
};

type RecipeStep = {
  step_no?: number;
  content?: string;
  image_url?: string;
};

type Creator = {
  id: string;
  avatar_url?: string | null;
  display_name?: string | null;
};

function isRatingArray(value: unknown): value is Rating[] {
  return (
    Array.isArray(value) &&
    value.every((r) => typeof r === 'object' && r !== null && 'stars' in r)
  );
}

function isIngredientArray(value: unknown): value is Ingredient[] {
  return Array.isArray(value);
}

function isRecipeStepArray(value: unknown): value is RecipeStep[] {
  return Array.isArray(value);
}

function isCreator(value: unknown): value is Creator {
  return typeof value === 'object' && value !== null && 'id' in value;
}

export default function DishDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: dish, isLoading, error, refetch } = useGetDishQuery(id!);

  const cover = dish?.images?.[0];
  const tips = dish?.tips ?? undefined;
  const ratings = dish?.ratings ?? [];
  const ingredients = dish?.ingredients ?? [];
  const steps = dish?.steps ?? [];
  const creator = dish?.creator ?? undefined;

  const avgStars =
    dish?.rating_avg ??
    (ratings.length
      ? ratings.reduce((a, r) => a + (r.stars || 0), 0) / ratings.length
      : 0);

  const dishData = dish as unknown;
  console.log(dishData);

  const ratingsRaw =
    typeof dishData === 'object' && dishData !== null && 'ratings' in dishData
      ? dishData.ratings
      : undefined;

  const ingredientsRaw =
    typeof dishData === 'object' &&
    dishData !== null &&
    'dish_ingredients' in dishData
      ? dishData.dish_ingredients
      : undefined;

  const stepsRaw =
    typeof dishData === 'object' &&
    dishData !== null &&
    'recipe_steps' in dishData
      ? dishData.recipe_steps
      : undefined;

  const creatorRaw =
    typeof dishData === 'object' && dishData !== null && 'creator' in dishData
      ? dishData.creator
      : undefined;

  // Ingredient checklist state
  const [checkedIng, setCheckedIng] = React.useState<Record<number, boolean>>(
    {},
  );
  const toggleIng = (idx: number) =>
    setCheckedIng((s) => ({ ...s, [idx]: !s[idx] }));

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !dish) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={32} color="#dc2626" />
        <Text style={styles.errorTitle}>Không thể tải công thức</Text>
        <Text style={styles.errorSub}>
          Vui lòng kiểm tra kết nối và thử lại
        </Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: insets.bottom + 28 },
      ]}
    >
      {/* Header bar */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>
        <Text style={styles.headerBarTitle}>Chi tiết công thức</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Hero image + gradient overlay + title + badges */}
      <View style={styles.heroSection}>
        <Image
          source={
            cover
              ? { uri: cover }
              : { uri: 'https://picsum.photos/800/500?blur=3' }
          }
          style={styles.heroImage}
          resizeMode="cover"
        />

        {dish.video_url ? (
          <>
            <SectionHeader
              title="Video hướng dẫn"
              icon={<Ionicons name="play-circle" size={18} color="#3730A3" />}
            />
            <VideoBlock url={dish.video_url} poster={cover} />
          </>
        ) : null}

        <LinearGradient
          colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.65)']}
          style={styles.heroGradient}
        />

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle} numberOfLines={3}>
            {dish.name}
          </Text>

          <View style={styles.heroBadges}>
            {!!dish.category?.name && (
              <Chip
                icon={<Ionicons name="pricetag" size={14} color="#3730A3" />}
                label={dish.category.name}
                tone="primary"
              />
            )}
            {!!dish.diet && (
              <Chip
                icon={
                  <MaterialCommunityIcons
                    name={dish.diet === 'veg' ? 'leaf' : 'food-drumstick'}
                    size={14}
                    color={dish.diet === 'veg' ? '#065F46' : '#9A3412'}
                  />
                }
                label={dish.diet === 'veg' ? 'Chay' : 'Mặn'}
                tone={dish.diet === 'veg' ? 'success' : 'warning'}
              />
            )}
          </View>
        </View>
      </View>

      <View style={styles.bodyPadding}>
        {/* Meta badges: time + servings + rating */}
        <View style={styles.metaChips}>
          {!!dish.time_minutes && (
            <Chip
              icon={<Ionicons name="time" size={14} color="#3730A3" />}
              label={`${dish.time_minutes} phút`}
              tone="primary"
            />
          )}
          {!!dish.servings && (
            <Chip
              icon={<Ionicons name="people" size={14} color="#374151" />}
              label={`${dish.servings} suất`}
              tone="neutral"
            />
          )}
          {avgStars > 0 && (
            <Chip
              icon={<Ionicons name="star" size={14} color="#f59e0b" />}
              label={`${avgStars.toFixed(1)} (${ratings?.length ?? 0})`}
              tone="warning"
            />
          )}
        </View>

        {/* Creator card */}
        {creator?.display_name ? (
          <View style={styles.creatorCard}>
            <Image
              source={{
                uri:
                  creator.avatar_url ??
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name || 'Chef')}&background=2563EB&color=fff`,
              }}
              style={styles.creatorAvatar}
            />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>{creator.display_name}</Text>
              <Text style={styles.creatorRole}>Đầu bếp</Text>
            </View>
            <Pressable style={styles.creatorFollowBtn}>
              <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
            </Pressable>
          </View>
        ) : null}

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <FavoriteButton dish={dish} mode="action" />
          <ActionBtn
            icon={<Feather name="star" size={16} color="#111827" />}
            label="Đánh giá"
            onPress={() => {}}
          />
          <ActionBtn
            icon={<Feather name="message-circle" size={16} color="#111827" />}
            label="Bình luận"
            onPress={() => {}}
          />
          <ActionBtn
            icon={<Feather name="share-2" size={16} color="#111827" />}
            label="Chia sẻ"
            onPress={() =>
              Share.share({
                message: `${dish.name} - ${dish.description ?? ''}\n\nXem công thức trên MChef`,
              })
            }
          />
        </View>

        {/* Description */}
        {dish.description ? (
          <Card title="Mô tả">
            <Text style={styles.descText}>{dish.description}</Text>
          </Card>
        ) : null}

        {/* Tips */}
        {tips ? (
          <Card title="💡 Mẹo nấu ăn" tone="success">
            <Text style={styles.tipsText}>{tips}</Text>
          </Card>
        ) : null}

        {/* Ingredients */}
        {Array.isArray(ingredients) && ingredients.length > 0 ? (
          <>
            <SectionHeader
              title="Nguyên liệu"
              icon={<Ionicons name="basket" size={18} color="#3730A3" />}
            />
            <View style={styles.ingredientsList}>
              {ingredients.map((ing, idx) => {
                const checked = !!checkedIng[idx];
                const line =
                  (ing.ingredient ?? 'Nguyên liệu') +
                  (ing.amount
                    ? ` – ${ing.amount}${ing.note ? ' ' + ing.note : ''}`
                    : '');

                return (
                  <Pressable
                    key={idx}
                    onPress={() => toggleIng(idx)}
                    style={[
                      styles.ingredientItem,
                      checked && styles.ingredientItemChecked,
                    ]}
                  >
                    <Ionicons
                      name={checked ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={checked ? '#2563EB' : '#9CA3AF'}
                    />
                    <Text
                      style={[
                        styles.ingredientText,
                        checked && styles.ingredientTextChecked,
                      ]}
                    >
                      {line}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {/* Steps */}
        {Array.isArray(steps) && steps.length > 0 ? (
          <>
            <SectionHeader
              title="Hướng dẫn thực hiện"
              icon={<Ionicons name="list-circle" size={18} color="#3730A3" />}
            />
            <View style={styles.stepsContainer}>
              {steps
                .slice()
                .sort((a, b) => (a.step_no ?? 0) - (b.step_no ?? 0))
                .map((st, idx) => (
                  <View
                    key={`${st.step_no ?? idx}-${idx}`}
                    style={styles.stepRow}
                  >
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>
                        {st.step_no ?? idx + 1}
                      </Text>
                    </View>
                    <View style={styles.stepContent}>
                      {st.image_url ? (
                        <Image
                          source={{ uri: st.image_url }}
                          style={styles.stepImage}
                          resizeMode="cover"
                        />
                      ) : null}
                      <Text style={styles.stepText}>{st.content}</Text>
                    </View>
                  </View>
                ))}
            </View>
          </>
        ) : null}

        {/* Ratings */}
        {Array.isArray(ratings) && ratings.length > 0 ? (
          <>
            <SectionHeader
              title="Đánh giá từ người dùng"
              icon={<Ionicons name="star" size={18} color="#f59e0b" />}
            />
            <Card
              title={`${avgStars.toFixed(1)} ⭐ (${ratings.length} đánh giá)`}
              tone="neutral"
            >
              <View style={styles.ratingsContainer}>
                {ratings.slice(0, 5).map((r, idx) => (
                  <View key={idx} style={styles.ratingItem}>
                    <View style={styles.ratingHeader}>
                      <Text style={styles.ratingStars}>
                        {'⭐'.repeat(Math.max(1, Math.min(r.stars ?? 0, 5)))}
                      </Text>
                      {r.created_at && (
                        <Text style={styles.ratingDate}>
                          {new Date(r.created_at).toLocaleDateString('vi-VN')}
                        </Text>
                      )}
                    </View>
                    {r.comment && (
                      <Text style={styles.ratingComment}>{r.comment}</Text>
                    )}
                  </View>
                ))}
              </View>
              <Pressable style={styles.writeReviewBtn}>
                <Ionicons name="create-outline" size={16} color="#2563EB" />
                <Text style={styles.writeReviewBtnText}>
                  Viết đánh giá của bạn
                </Text>
              </Pressable>
            </Card>
          </>
        ) : null}

        <View style={{ height: 12 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f9fafb' },
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
    marginTop: 12,
    color: '#111827',
  },
  errorSub: { color: '#6b7280', marginTop: 6, textAlign: 'center' },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  retryBtnText: { color: '#fff', fontWeight: '700' },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerBarTitle: { fontWeight: '700', fontSize: 16, color: '#111827' },

  heroSection: { position: 'relative', marginBottom: 16 },
  heroImage: { width: '100%', height: 240 },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
  },
  heroContent: { position: 'absolute', left: 16, right: 16, bottom: 12 },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 8,
    marginBottom: 12,
  },
  heroBadges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },

  bodyPadding: { paddingHorizontal: 16 },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 999,
  },
  chipText: { fontWeight: '700', fontSize: 12 },

  metaChips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
  },

  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  creatorAvatar: { width: 44, height: 44, borderRadius: 22 },
  creatorInfo: { flex: 1, marginLeft: 12 },
  creatorName: { fontWeight: '700', color: '#111827' },
  creatorRole: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  creatorFollowBtn: { padding: 6 },

  actionRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  actionBtnText: { fontWeight: '600', fontSize: 12, color: '#111827' },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 },
  cardTitle: { fontWeight: '800', fontSize: 16 },
  cardContent: { paddingHorizontal: 14, paddingBottom: 14 },

  descText: { lineHeight: 20, color: '#374151' },
  tipsText: { lineHeight: 20, color: '#065f46', fontWeight: '500' },

  sectionHeader: { paddingHorizontal: 4, marginTop: 16, marginBottom: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },

  ingredientsList: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  ingredientItemChecked: { backgroundColor: '#f9fafb' },
  ingredientText: { flex: 1, color: '#111827' },
  ingredientTextChecked: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },

  stepsContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    gap: 16,
  },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: { color: '#3730a3', fontWeight: '700', fontSize: 12 },
  stepContent: { flex: 1, gap: 8 },
  stepImage: { width: '100%', height: 160, borderRadius: 10 },
  stepText: { color: '#374151', lineHeight: 20 },

  ratingsContainer: { gap: 10, marginBottom: 12 },
  ratingItem: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingStars: { fontWeight: '700' },
  ratingDate: { color: '#9ca3af', fontSize: 12 },
  ratingComment: { marginTop: 6, color: '#374151', lineHeight: 18 },

  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 12,
  },
  video: { width: '100%', height: '100%' },
  webview: { width: '100%', height: '100%', backgroundColor: '#000' },
  writeReviewBtnText: { color: '#2563EB', fontWeight: '700' },
});
