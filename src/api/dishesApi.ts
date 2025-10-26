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

function mapCategory(c: CategoryBE): Category {
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

function mapDish(d: DishBE): Dish {
  const cover = d.cover_image_url ?? '';
  const images = cover ? [cover] : [];

  return {
    id: d.id,
    name: d.title ?? d.name ?? '',
    slug: d.slug ?? '',
    images,
    description: d.description ?? null,
    diet: d.diet ?? null,
    category: d.category ? mapCategory(d.category) : null,
    servings: d.servings ?? null,
    time_minutes: d.time_minutes ?? null,
    created_by: d.created_by ?? null,
    created_at: d.created_at ?? undefined,
    updated_at: d.updated_at ?? undefined,
    status: d.status ?? 'draft',
    published: d.status === 'published',
  };
}

export const dishesApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listDishes: b.query<Dish[], { category_id?: string; status?: string }>({
      query: (params) => {
        console.log('[DishesApi] listDishes query:', params);
        const sp = new URLSearchParams();
        if (params.category_id) sp.append('category_id', params.category_id);
        if (params.status) sp.append('status', params.status);

        const qs = sp.toString();
        return { url: qs ? `/dishes?${qs}` : '/dishes' };
      },
      transformResponse: (resp: unknown) => {
        console.log('[DishesApi] listDishes response:', resp);
        const list = unwrapList<DishBE>(resp);
        return list.map(mapDish);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Dishes' as const, id })),
              { type: 'Dishes', id: 'LIST' },
            ]
          : [{ type: 'Dishes', id: 'LIST' }],
    }),

    getDish: b.query<Dish, string>({
      query: (id) => {
        console.log('[DishesApi] getDish query:', id);
        return { url: `/dishes/${id}` };
      },
      transformResponse: (resp: unknown) => {
        console.log('[DishesApi] getDish response:', resp);
        const d = unwrapOne<DishBE>(resp);
        if (!d) throw new Error('Dish not found');
        return mapDish(d);
      },
      providesTags: (_r, _e, id) => [{ type: 'Dishes', id }],
    }),

    getHome: b.query<{ featured: Dish[]; recent: Dish[] }, void>({
      query: () => {
        console.log('[DishesApi] getHome query');
        return { url: '/dishes/home' };
      },
      transformResponse: (resp: unknown) => {
        console.log('[DishesApi] getHome response:', resp);
        if (!resp || typeof resp !== 'object') {
          return { featured: [], recent: [] };
        }
        const obj = resp as Record<string, any>;
        // chấp nhận nhiều khóa: featured/recent hoặc data.featured/data.recent
        const fSrc = obj.featured ?? obj.data?.featured ?? [];
        const rSrc = obj.recent ?? obj.data?.recent ?? [];
        const featured = unwrapList<DishBE>(fSrc).map(mapDish);
        const recent = unwrapList<DishBE>(rSrc).map(mapDish);
        return { featured, recent };
      },
    }),

    createDish: b.mutation<Dish, DishInput>({
      query: (body) => {
        console.log('[DishesApi] createDish query:', body);
        return { url: '/dishes', method: 'POST', body };
      },
      transformResponse: (resp: unknown) => {
        console.log('[DishesApi] createDish response:', resp);
        const d = unwrapOne<DishBE>(resp);
        if (!d) throw new Error('Failed to create dish');
        return mapDish(d);
      },
      invalidatesTags: [{ type: 'Dishes', id: 'LIST' }],
    }),

    updateDish: b.mutation<Dish, { id: string; data: Partial<DishInput> }>({
      query: ({ id, data }) => {
        console.log('[DishesApi] updateDish query:', { id, data });
        return { url: `/dishes/${id}`, method: 'PUT', body: data };
      },
      transformResponse: (resp: unknown) => {
        console.log('[DishesApi] updateDish response:', resp);
        const d = unwrapOne<DishBE>(resp);
        if (!d) throw new Error('Failed to update dish');
        return mapDish(d);
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Dishes', id },
        { type: 'Dishes', id: 'LIST' },
      ],
    }),

    deleteDish: b.mutation<void, string>({
      query: (id) => {
        console.log('[DishesApi] deleteDish query:', id);
        return { url: `/dishes/${id}`, method: 'DELETE' };
      },
      transformResponse: (resp: unknown) => {
        console.log('[DishesApi] deleteDish response:', resp);
      },
      invalidatesTags: (_r, _e, id) => [
        { type: 'Dishes', id },
        { type: 'Dishes', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListDishesQuery,
  useGetDishQuery,
  useGetHomeQuery,
  useCreateDishMutation,
  useUpdateDishMutation,
  useDeleteDishMutation,
} = dishesApi;
