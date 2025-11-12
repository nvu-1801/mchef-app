// src/api/dishesApi.ts
import { baseApi } from './baseApi';
import type {
  Dish,
  DishBE,
  DishInput,
  Category,
  CategoryBE,
} from '@/src/types/dish';

// Helper functions
function unwrapOne<T>(resp: unknown): T | null {
  if (!resp || typeof resp !== 'object') return null;
  const obj = resp as Record<string, any>;

  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    return obj.data as T;
  }
  // các trường hợp thường gặp khác
  if (obj.item && typeof obj.item === 'object') return obj.item as T;
  if (obj.record && typeof obj.record === 'object') return obj.record as T;
  if (!Array.isArray(obj) && obj.id) return obj as T;
  return null;
}

function unwrapList<T>(resp: unknown): T[] {
  if (!resp || typeof resp !== 'object') return [];
  const obj = resp as Record<string, any>;

  if (Array.isArray(obj.data)) return obj.data as T[];
  if (Array.isArray(obj.items)) return obj.items as T[];
  if (Array.isArray(obj.results)) return obj.results as T[];
  if (Array.isArray(obj.list)) return obj.list as T[];
  if (Array.isArray(obj)) return obj as T[];
  return [];
}

function mapCategory(c: CategoryBE | null | undefined): Category | null {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug ?? undefined,
    description: c.description ?? undefined,
    image_url: c.image_url ?? undefined,
    parent_id: c.parent_id ?? undefined,
    is_active: c.is_active ?? true,
    created_at: c.created_at ?? undefined,
    updated_at: c.updated_at ?? undefined,
  };
}

function collectImages(d: DishBE): string[] {
  const cover = d.cover_image_url ?? '';
  const others = (d.dish_images ?? [])
    .map((i) => i?.image_url)
    .filter((u): u is string => !!u);
  const arr = cover ? [cover, ...others] : others;
  // unique
  return Array.from(new Set(arr));
}

function baseFields(d: DishBE) {
  return {
    id: d.id,
    name: d.title ?? d.name ?? '',
    slug: d.slug ?? '',
    video_url: d.video_url ?? null,
    description: d.description ?? null,
    diet: d.diet ?? null,
    category: mapCategory(d.category),
    servings: d.servings ?? null,
    time_minutes: d.time_minutes ?? null,
    created_by: d.created_by ?? null,
    created_at: d.created_at ?? undefined,
    updated_at: d.updated_at ?? undefined,
    // status mapping CHUẨN theo BE
    published: !!d.published,
    review_status: d.review_status ?? undefined,
  };
}

// Summary cho list (nhẹ, đủ render card)
function mapDishSummary(d: DishBE): Dish {
  return {
    ...baseFields(d),
    images: collectImages(d),
  };
}

// Detail đầy đủ field
function mapDishDetail(d: DishBE): Dish {
  const stats = d.dish_rating_stats?.[0];
  return {
    ...baseFields(d),
    images: collectImages(d),
    tips: d.tips ?? null,
    video_url: d.video_url ?? null,
    premium: d.premium ?? null,
    ingredients: d.dish_ingredients ?? null,
    steps: d.recipe_steps ?? null,
    ratings: d.ratings ?? null,
    rating_avg: stats?.rating_avg ?? null,
    rating_count: stats?.rating_count ?? d.ratings?.length ?? null,
    creator: d.creator ?? null,
  };
}

export const dishesApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listDishes: b.query<
      Dish[],
      { category_id?: string; status?: string } | void
    >({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params?.category_id) sp.append('category_id', params.category_id);
        if (params?.status) sp.append('status', params.status);
        const qs = sp.toString();
        return { url: qs ? `/dishes?${qs}` : '/dishes' };
      },
      transformResponse: (resp: unknown) =>
        unwrapList<DishBE>(resp).map(mapDishSummary),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Dishes' as const, id })),
              { type: 'Dishes', id: 'LIST' },
            ]
          : [{ type: 'Dishes', id: 'LIST' }],
    }),

    getDish: b.query<Dish, string>({
      query: (id) => ({ url: `/dishes/${id}` }),
      transformResponse: (resp: unknown) => {
        const d = unwrapOne<DishBE>(resp);
        if (!d) throw new Error('Dish not found');
        return mapDishDetail(d);
      },
      providesTags: (_r, _e, id) => [{ type: 'Dishes', id }],
    }),

    getHome: b.query<{ featured: Dish[]; recent: Dish[] }, void>({
      query: () => ({ url: '/dishes/home' }),
      transformResponse: (resp: unknown) => {
        if (!resp || typeof resp !== 'object')
          return { featured: [], recent: [] };
        const obj = resp as Record<string, any>;
        const featured = unwrapList<DishBE>(
          obj.featured ?? obj.data?.featured ?? [],
        ).map(mapDishSummary);
        const recent = unwrapList<DishBE>(
          obj.recent ?? obj.data?.recent ?? [],
        ).map(mapDishSummary);
        return { featured, recent };
      },
    }),

    createDish: b.mutation<Dish, any>({
      query: (body) => ({ url: '/dishes', method: 'POST', body }),
      transformResponse: (resp: unknown) => {
        const d = unwrapOne<DishBE>(resp);
        if (!d) throw new Error('Failed to create dish');
        return mapDishDetail(d);
      },
      invalidatesTags: [{ type: 'Dishes', id: 'LIST' }],
    }),

    updateDish: b.mutation<Dish, { id: string; data: Partial<any> }>({
      query: ({ id, data }) => ({
        url: `/dishes/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (resp: unknown) => {
        const d = unwrapOne<DishBE>(resp);
        if (!d) throw new Error('Failed to update dish');
        return mapDishDetail(d);
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Dishes', id },
        { type: 'Dishes', id: 'LIST' },
      ],
    }),

    deleteDish: b.mutation<void, string>({
      query: (id) => ({ url: `/dishes/${id}`, method: 'DELETE' }),
      transformResponse: () => {},
      invalidatesTags: (_r, _e, id) => [
        { type: 'Dishes', id },
        { type: 'Dishes', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: process.env.NODE_ENV !== 'production',
});

export const {
  useListDishesQuery,
  useGetDishQuery,
  useGetHomeQuery,
  useCreateDishMutation,
  useUpdateDishMutation,
  useDeleteDishMutation,
} = dishesApi;
