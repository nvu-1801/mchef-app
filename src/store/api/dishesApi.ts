import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../storage/store";

// UI type sau khi map từ BE
export type Dish = {
  id: string;
  name: string;               // <-- từ BE.title
  slug: string;
  images: string[];           // <-- từ BE.cover_image_url
  description?: string;
  diet?: "veg" | "nonveg" | string;
  category?: { name: string; slug: string } | null;
  servings?: number;
  time_minutes?: number;
};

// Raw từ BE
type DishBE = {
  id: string;
  title: string;
  slug: string;
  cover_image_url?: string;
  description?: string;
  diet?: string;
  categories?: { name: string; slug: string } | null;
  servings?: number;
  time_minutes?: number;
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:4000/api";
const ASSET_BASE = process.env.EXPO_PUBLIC_ASSET_BASE ?? "http://10.0.2.2:4000";

const toFullUrl = (p?: string) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  return `${ASSET_BASE}/${p.replace(/^\/+/, "")}`; // "dishes/xxx.jpg" -> http://.../dishes/xxx.jpg
};

export const dishesApi = createApi({
  reducerPath: "dishesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Dishes"],
  endpoints: (b) => ({
    listDishes: b.query<Dish[], { q?: string } | void>({
      query: (arg) => `/dishes${arg?.q ? `?q=${encodeURIComponent(arg.q)}` : ""}`,
      transformResponse: (resp: DishBE[] | { data: DishBE[] }) => {
        const arr = Array.isArray(resp) ? resp : resp?.data ?? [];
        return arr.map((d) => ({
          id: d.id,
          name: d.title,
          slug: d.slug,
          images: d.cover_image_url ? [toFullUrl(d.cover_image_url)] : [],
          description: d.description,
          diet: d.diet,
          category: d.categories ?? null,
          servings: d.servings,
          time_minutes: d.time_minutes,
        }));
      },
      providesTags: ["Dishes"],
    }),
    getDish: b.query<Dish, string>({
      query: (id) => `/dishes/${id}`,
      transformResponse: (resp: DishBE | { data: DishBE }) => {
        const d = (resp as any).data ?? (resp as DishBE);
        return {
          id: d.id,
          name: d.title,
          slug: d.slug,
          images: d.cover_image_url ? [toFullUrl(d.cover_image_url)] : [],
          description: d.description,
          diet: d.diet,
          category: d.categories ?? null,
          servings: d.servings,
          time_minutes: d.time_minutes,
        };
      },
      providesTags: (_r, _e, id) => [{ type: "Dishes" as const, id }],
    }),
  }),
});

export const { useListDishesQuery, useGetDishQuery } = dishesApi;
