import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../auth/tokenBridge';

export type Dish = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  description?: string;
  diet?: 'veg' | 'nonveg' | string;
  category?: { id?: string; name: string; slug: string } | null;
  servings?: number;
  time_minutes?: number;
};

type DishBE = {
  id: string;
  title: string;
  slug: string;
  cover_image_url?: string;
  description?: string;
  diet?: string;
  category?: { id?: string; name: string; slug: string } | null;
  servings?: number;
  time_minutes?: number;
};

const DEBUG = process.env.EXPO_PUBLIC_DEBUG === 'true';

// Use deployed API by default
const API_BASE = (
  process.env.EXPO_PUBLIC_API_URL || 'https://mchef-be-m168.vercel.app/api'
).replace(/\/+$/, '');
const ASSET_BASE = (
  process.env.EXPO_PUBLIC_ASSET_BASE || API_BASE.replace(/\/api$/, '')
).replace(/\/+$/, '');
const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(
  /\/+$/,
  '',
);

if (DEBUG) {
  console.log('[DishesApi] API_BASE:', API_BASE);
  console.log('[DishesApi] ASSET_BASE:', ASSET_BASE);
  if (!SUPABASE_URL)
    console.warn('[DishesApi] SUPABASE_URL is empty — storage URLs may fail');
}

function toFullUrl(p?: string) {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.replace(/^\/+/, '');
  if (/^storage\/v1\/object\/public\//i.test(clean)) {
    return SUPABASE_URL ? `${SUPABASE_URL}/${clean}` : '';
  }
  return ASSET_BASE ? `${ASSET_BASE}/${clean}` : '';
}

function unwrapList(resp: unknown): DishBE[] {
  if (Array.isArray(resp)) return resp as DishBE[];
  if (resp && typeof resp === 'object') {
    const anyResp = resp as any;
    if (Array.isArray(anyResp.data)) return anyResp.data as DishBE[];
    if (Array.isArray(anyResp.items)) return anyResp.items as DishBE[];
    if (Array.isArray(anyResp.dishes)) return anyResp.dishes as DishBE[];
  }
  if (DEBUG) console.warn('[DishesApi] unwrapList: unexpected structure', resp);
  return [];
}

function unwrapOne(resp: unknown): DishBE | null {
  if (!resp) return null;
  if (Array.isArray(resp)) return (resp[0] as DishBE) ?? null;
  if (typeof resp === 'object') {
    const anyResp = resp as any;
    return (
      (anyResp.data as DishBE) ||
      (anyResp.item as DishBE) ||
      (anyResp as DishBE) ||
      null
    );
  }
  return null;
}

const mapDish = (d: DishBE): Dish => ({
  id: d.id,
  name: d.title,
  slug: d.slug,
  images: d.cover_image_url ? [toFullUrl(d.cover_image_url)] : [],
  description: d.description,
  diet: d.diet,
  category: d.category ?? null,
  servings: d.servings,
  time_minutes: d.time_minutes,
});

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
        const mapped = unwrapList(resp).map(mapDish);
        if (DEBUG)
          console.log('[DishesApi] listDishes →', mapped.length, 'items');
        return mapped;
      },
    }),
    getDish: b.query<Dish, string>({
      query: (id) => `/dishes/${id}`,
      transformResponse: (resp: unknown) => {
        const d = unwrapOne(resp);
        if (!d) throw new Error('Dish not found');
        return mapDish(d);
      },
    }),
    getHome: b.query<any, void>({
      query: () => '/home',
      transformResponse: (resp: unknown) => {
        if (DEBUG) console.log('[DishesApi] getHome →', resp);
        return resp;
      },
    }),
  }),
});

export const { useListDishesQuery, useGetDishQuery, useGetHomeQuery } =
  dishesApi;
