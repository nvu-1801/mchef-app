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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';

import { useGetDishQuery } from '@/src/api/dishesApi';
import { useAppDispatch, useAppSelector } from '@/src/hooks/hooks';
import { toggleFavorite } from '@/src/features/favorites/favoritesSlice';
import  { FavoriteButton } from '@/src/components/common/FavoriteButton';

function Chip({
  icon,
  label,
  tone = 'primary',
}: {
  icon?: React.ReactNode;
  label: string;
  tone?: 'primary' | 'success' | 'warning' | 'neutral';
}) {
  const palette: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' },   // indigo
    success: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },   // emerald
    warning: { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },   // orange
    neutral: { bg: '#F5F5F5', text: '#374151', border: '#E5E7EB' },   // gray
  };
  const c = palette[tone] ?? palette.primary;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: c.bg,
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: 999,
      }}
    >
      {icon}
      <Text style={{ color: c.text, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={{ paddingHorizontal: 4, marginTop: 8, marginBottom: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>{title}</Text>
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
    <View
      style={{
        borderWidth: 1,
        borderColor: borderByTone[tone],
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 }}>
        <Text style={{ fontWeight: '800', color: headerColorByTone[tone], fontSize: 16 }}>
          {title}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>{children}</View>
    </View>
  );
}

export default function DishDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: dish, isLoading, error, refetch } = useGetDishQuery(id!);

  const dispatch = useAppDispatch();
  const favs = useAppSelector((s) => s.favorites.items);
  const isFav = dish ? favs.includes(dish.id) : false;

  // mở rộng theo JSON backend
  const tips = (dish as any)?.tips as string | undefined;
  const ratings = (dish as any)?.ratings as
    | { stars: number; comment?: string; user_id?: string; created_at?: string }[]
    | undefined;
  const ingredients = (dish as any)?.dish_ingredients as
    | { name?: string; qty?: string; note?: string }[]
    | undefined;
  const steps = (dish as any)?.recipe_steps as
    | { order?: number; content?: string; image_url?: string }[]
    | undefined;
  const creator = (dish as any)?.creator as
    | { id: string; avatar_url?: string | null; display_name?: string | null }
    | undefined;

  // state tích chọn nguyên liệu
  const [checkedIng, setCheckedIng] = React.useState<Record<number, boolean>>({});
  const toggleIng = (idx: number) =>
    setCheckedIng((s) => ({ ...s, [idx]: !s[idx] }));

  // điểm trung bình
  const avgStars =
    Array.isArray(ratings) && ratings.length > 0
      ? ratings.reduce((a, r) => a + (r.stars || 0), 0) / ratings.length
      : 0;

  if (isLoading) return <ActivityIndicator style={{ marginTop: 24 }} size="large" />;

  if (error || !dish) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ marginBottom: 8 }}>Không tải được món ăn.</Text>
        <Pressable
          onPress={() => refetch()}
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
          }}
        >
          <Text>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  const cover = dish.images?.[0];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
      {/* Top app bar (title) */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
          }}
        >
          <Ionicons name="arrow-back" size={18} />
        </Pressable>
        <Text style={{ fontWeight: '700', fontSize: 16 }}>Chi tiết công thức</Text>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={() => dispatch(toggleFavorite({ dishId: dish.id }))}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
          }}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={18}
            color={isFav ? '#EF4444' : '#111827'}
          />
        </Pressable>
      </View>

      {/* Banner ảnh + overlay + title + chips */}
      <View style={{ position: 'relative' }}>
        <Image
          source={
            cover
              ? { uri: cover }
              : { uri: 'https://picsum.photos/800/500?blur=3' }
          }
          style={{ width: '100%', height: 220 }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.6)']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 140,
          }}
        />

        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 12 }}>
          <Text
            style={{
              color: '#fff',
              fontSize: 24,
              fontWeight: '800',
              textShadowColor: 'rgba(0,0,0,0.3)',
              textShadowRadius: 8,
            }}
            numberOfLines={2}
          >
            {dish.name}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
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
                  <Ionicons
                    name={dish.diet === 'veg' ? 'leaf' : 'restaurant'}
                    size={14}
                    color={dish.diet === 'veg' ? '#065F46' : '#9A3412'}
                  />
                }
                label={dish.diet === 'veg' ? 'Món chay' : 'Món mặn'}
                tone={dish.diet === 'veg' ? 'success' : 'warning'}
              />
            )}
          </View>
        </View>
      </View>

      {/* Thẻ Chef + hàng action */}
      <View style={{ paddingHorizontal: 16, marginTop: 14, gap: 12 }}>
        {creator?.display_name ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 14,
              backgroundColor: '#fff',
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Image
              source={{
                uri:
                  creator.avatar_url ??
                  'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(creator.display_name || 'Chef'),
              }}
              style={{ width: 44, height: 44, borderRadius: 22 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700' }}>{creator.display_name}</Text>
              <Pressable
                onPress={() => {}}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}
              >
                <Feather name="user" size={14} color="#6B7280" />
                <Text style={{ color: '#6B7280' }}>Xem hồ sơ</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Row hành động: Save / Rate / Comment / Share */}
        <View
          style={{
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 14,
            backgroundColor: '#fff',
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
        <FavoriteButton dishId={dish.id} mode="action" />
          <ActionBtn
            icon={<Feather name="star" size={16} color="#111827" />}
            label="Rate"
            onPress={() => {}}
          />
          <ActionBtn
            icon={<Feather name="message-circle" size={16} color="#111827" />}
            label="Comment"
            onPress={() => {}}
          />
          <ActionBtn
            icon={<Feather name="share-2" size={16} color="#111827" />}
            label="Share"
            onPress={() =>
              Share.share({
                message: `${dish.name} - ${dish.description ?? ''}`,
              })
            }
          />
        </View>

        {/* Meta chips */}
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {!!dish.time_minutes && (
            <Chip
              icon={<Ionicons name="time" size={14} color="#3730A3" />}
              label={`⏱ ${dish.time_minutes} phút`}
              tone="primary"
            />
          )}
          {!!dish.servings && (
            <Chip
              icon={<Ionicons name="people" size={14} color="#374151" />}
              label={`🍽 ${dish.servings} suất`}
              tone="neutral"
            />
          )}
        </View>

        {/* Mô tả */}
        {dish.description ? (
          <Card title="Mô tả">
            <Text style={{ lineHeight: 20, color: '#374151' }}>{dish.description}</Text>
          </Card>
        ) : null}

        {/* Tips */}
        {tips ? (
          <Card title="Mẹo nấu (Tips)" tone="success">
            <Text style={{ lineHeight: 20, color: '#065F46' }}>{tips}</Text>
          </Card>
        ) : null}

        {/* Nguyên liệu với checkbox */}
        {Array.isArray(ingredients) && ingredients.length > 0 ? (
          <>
            <SectionHeader title="Nguyên liệu" />
            <View
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 14,
                backgroundColor: '#fff',
                paddingVertical: 6,
              }}
            >
              {ingredients.map((ing, idx) => {
                const checked = !!checkedIng[idx];
                const line =
                  (ing.name ?? 'Nguyên liệu') +
                  (ing.qty ? ` – ${ing.qty}` : '') +
                  (ing.note ? ` (${ing.note})` : '');
                return (
                  <Pressable
                    key={idx}
                    onPress={() => toggleIng(idx)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <Ionicons
                      name={checked ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={checked ? '#4F46E5' : '#9CA3AF'}
                    />
                    <Text
                      style={{
                        flex: 1,
                        color: checked ? '#6B7280' : '#111827',
                        textDecorationLine: checked ? 'line-through' : 'none',
                      }}
                    >
                      {line}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {/* Hướng dẫn (bước) */}
        {Array.isArray(steps) && steps.length > 0 ? (
          <>
            <SectionHeader title="Hướng dẫn" />
            <View
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 14,
                backgroundColor: '#fff',
                padding: 12,
                gap: 12,
              }}
            >
              {steps
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((st, idx) => (
                  <View key={`${st.order ?? idx}-${idx}`} style={{ flexDirection: 'row', gap: 12 }}>
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        backgroundColor: '#EEF2FF',
                        borderWidth: 1,
                        borderColor: '#C7D2FE',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2,
                      }}
                    >
                      <Text style={{ color: '#3730A3', fontWeight: '700' }}>
                        {st.order ?? idx + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1, gap: 6 }}>
                      {st.image_url ? (
                        <Image
                          source={{ uri: st.image_url }}
                          style={{ width: '100%', height: 160, borderRadius: 10 }}
                          resizeMode="cover"
                        />
                      ) : null}
                      <Text style={{ color: '#374151', lineHeight: 20 }}>{st.content}</Text>
                    </View>
                  </View>
                ))}
            </View>
          </>
        ) : null}

        {/* Đánh giá */}
        {Array.isArray(ratings) && ratings.length > 0 ? (
          <Card title="Đánh giá" tone="neutral">
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontWeight: '800', fontSize: 18 }}>
                  {avgStars.toFixed(1)} ★
                </Text>
                <Text style={{ color: '#6B7280' }}>({ratings.length} đánh giá)</Text>
              </View>

              {ratings.slice(0, 5).map((r, idx) => (
                <View
                  key={idx}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    padding: 10,
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                    gap: 4,
                  }}
                >
                  <Text style={{ fontWeight: '700', color: '#111827' }}>
                    {'⭐'.repeat(Math.max(1, Math.min(r.stars ?? 0, 5)))}
                  </Text>
                  {r.comment ? <Text style={{ color: '#374151' }}>{r.comment}</Text> : null}
                  {r.created_at ? (
                    <Text style={{ color: '#6B7280', fontSize: 12 }}>
                      {new Date(r.created_at).toLocaleDateString('vi-VN')}
                    </Text>
                  ) : null}
                </View>
              ))}

              <Pressable
                onPress={() => {}}
                style={{
                  alignSelf: 'flex-start',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                }}
              >
                <Text>Viết đánh giá</Text>
              </Pressable>
            </View>
          </Card>
        ) : null}

        <View style={{ height: 12 }} />
      </View>
    </ScrollView>
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
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
      }}
    >
      {icon}
      <Text style={{ fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
