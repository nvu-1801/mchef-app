// src/api/dishesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../auth/tokenBridge';
import { Platform } from 'react-native';

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

// ---------- BASE URL ƯU TIÊN ENV, fallback là LAN IP 192.168.1.6 ----------
const LAN_HOST = 'http://192.168.1.6:4000'; // 👈 server local của bạn
// Nếu BE chạy trên máy host và bạn dùng Android emulator cổ điển (AVD),
// có thể thay LAN_HOST = 'http://10.0.2.2:4000' (tuỳ setup).
const DEFAULT_API_BASE = `${LAN_HOST}/api`;
const DEFAULT_ASSET_BASE = LAN_HOST;

const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') || DEFAULT_API_BASE;
const ASSET_BASE = process.env.EXPO_PUBLIC_ASSET_BASE?.replace(/\/+$/, '') || DEFAULT_ASSET_BASE;

const toFullUrl = (p?: string) => {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  return `${ASSET_BASE}/${p.replace(/^\/+/, '')}`;
};

// ---------- unwrap helpers ----------
function unwrapList(resp: unknown): DishBE[] {
  if (Array.isArray(resp)) return resp as DishBE[];
  if (resp && typeof resp === 'object') {
    const anyResp = resp as any;
    if (Array.isArray(anyResp.items)) return anyResp.items as DishBE[];
    if (Array.isArray(anyResp.data)) return anyResp.data as DishBE[];
  }
  return [];
}
function unwrapOne(resp: unknown): DishBE | null {
  if (!resp) return null;
  if (Array.isArray(resp)) return (resp[0] as DishBE) ?? null;
  if (typeof resp === 'object') {
    const anyResp = resp as any;
    if (anyResp.item) return anyResp.item as DishBE;
    if (anyResp.data) return anyResp.data as DishBE;
    return anyResp as DishBE;
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

// ---------- RTK Query ----------
export const dishesApi = createApi({
  reducerPath: 'dishesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE, // 👈 sẽ là http://192.168.1.6:4000/api nếu không đặt ENV
    prepareHeaders: (headers) => {
      const token = getAuthToken?.(); // nếu có auth thì tự gắn
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Dishes'],
  endpoints: (b) => ({
    listDishes: b.query<Dish[], { q?: string } | void>({
      query: (arg) => `/dishes${arg?.q ? `?q=${encodeURIComponent(arg.q)}` : ''}`,
      transformResponse: (resp: unknown) => unwrapList(resp).map(mapDish),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: 'Dishes' as const, id: r.id })),
              { type: 'Dishes' as const, id: 'LIST' },
            ]
          : [{ type: 'Dishes' as const, id: 'LIST' }],
    }),
    getDish: b.query<Dish, string>({
      query: (id) => `/dishes/${id}`,
      transformResponse: (resp: unknown) => {
        const d = unwrapOne(resp);
        if (!d) throw new Error('Dish not found');
        return mapDish(d);
      },
      providesTags: (_r, _e, id) => [{ type: 'Dishes' as const, id }],
    }),
  }),
});

export const { useListDishesQuery, useGetDishQuery } = dishesApi;
