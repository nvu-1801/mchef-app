// src/api/dishesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../auth/tokenBridge';
import {
  Dish,
  DishBE,
  DishInput,
  unwrapList,
  unwrapOne,
  mapDishBEToDish,
  toFullUrl,
} from '@/src/types/dish';

const DEBUG = process.env.EXPO_PUBLIC_DEBUG === 'true';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL || 'https://mchef-be-m168.vercel.app/api').replace(/\/+$/, '');
const ASSET_BASE = (process.env.EXPO_PUBLIC_ASSET_BASE || API_BASE.replace(/\/api$/, '')).replace(/\/+$/, '');
const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');

const mapDish = (d: DishBE): Dish =>
  mapDishBEToDish(d, { supabaseUrl: SUPABASE_URL, assetBase: ASSET_BASE });

export const dishesApi = createApi({
  reducerPath: 'dishesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      try {
        const token = getAuthToken?.();
        if (token) headers.set('Authorization', `Bearer ${token}`);
      } catch {}
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Dishes'],
  endpoints: (b) => ({
    listDishes: b.query<Dish[], void>({
      query: () => '/dishes',
      transformResponse: (resp: unknown) => {
        const mapped = unwrapList<DishBE>(resp).map(mapDish);
        if (DEBUG) console.log('[DishesApi] listDishes →', mapped.length, 'items');
        return mapped;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: 'Dishes' as const, id: d.id })),
              { type: 'Dishes' as const, id: 'LIST' },
            ]
          : [{ type: 'Dishes' as const, id: 'LIST' }],
    }),
    getDish: b.query<Dish, string>({
      query: (id) => `/dishes/${id}`,
      transformResponse: (resp: unknown) => {
        const d = unwrapOne<DishBE>(resp);
        if (!d) throw new Error('Dish not found');
        return mapDish(d);
      },
      providesTags: (_result, _error, id) => [{ type: 'Dishes' as const, id }],
    }),
    getHome: b.query<any, void>({
      query: () => '/home',
      transformResponse: (resp: unknown) => {
        if (DEBUG) console.log('[DishesApi] getHome →', resp);
        return resp;
      },
    }),
    createDish: b.mutation<Dish, DishInput>({
      query: (body) => ({ url: '/dishes', method: 'POST', body }),
      transformResponse: (resp: unknown) => {
        const d = unwrapOne<DishBE>(resp);
        if (!d) throw new Error('Failed to create dish');
        return mapDish(d);
      },
      invalidatesTags: [{ type: 'Dishes', id: 'LIST' }],
    }),
    updateDish: b.mutation<Dish, { id: string; data: Partial<DishInput> }>({
      query: ({ id, data }) => ({ url: `/dishes/${id}`, method: 'PUT', body: data }),
      transformResponse: (resp: unknown) => {
        const d = unwrapOne<DishBE>(resp);
        if (!d) throw new Error('Failed to update dish');
        return mapDish(d);
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Dishes', id }, { type: 'Dishes', id: 'LIST' }],
    }),
    deleteDish: b.mutation<void, string>({
      query: (id) => ({ url: `/dishes/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Dishes', id }, { type: 'Dishes', id: 'LIST' }],
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
