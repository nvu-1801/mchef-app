// src/types/dish.ts

/** —— Enums & primitives —— */
export type ID = string;
export type Diet = 'veg' | 'nonveg';
export type PublishStatus = 'draft' | 'published';

export interface Category {
  id?: ID;
  name?: string;
  slug?: string | null;
}

/** —— Kiểu từ Backend (raw) —— */
export interface DishBE {
  id: ID;
  title: string;
  slug: string;
  cover_image_url?: string | null;
  description?: string | null;
  diet?: Diet | string | null;
  category?: Category | null;
  servings?: number | null;
  time_minutes?: number | null;

  // các field đồng nghĩa (khác API có thể trả cái này cái kia)
  created_by?: ID | null;
  creator_id?: ID | null;
  user_id?: ID | null;

  // meta/tùy chọn
  created_at?: string;
  updated_at?: string;

  // đôi khi BE trả kèm
  images?: string[];
  tips?: string | null;
  name?: string | null;
}

/** —— Payload gửi lên Backend —— */
export interface DishInput {
  title: string;
  description?: string;
  cover_image_url?: string;
  diet?: Diet | string;
  category_id?: ID;
  servings?: number;
  time_minutes?: number;
  ingredients?: string[];
  instructions?: string[];
  status?: PublishStatus; // 'draft' | 'published'
}

/** —— Kiểu “Chuẩn hoá” trong app —— */
export interface Dish {
  id: ID;
  name: string;
  slug: string;
  images: string[];
  description?: string | null;
  diet?: Diet | string | null;
  category?: Category | null;
  servings?: number | null;
  time_minutes?: number | null;
  created_by?: ID | null;
  created_at?: string;
  updated_at?: string;
  published?: boolean | null; // nếu API có concept publish
}

/** —— Kiểu cho UI Card/List —— */
export interface DishCard {
  id: ID;
  title: string;
  summary: string;
  cover: string;
  updatedAt: string;
  published: boolean;
  category?: Category | null;
  servings?: number | null;
  time_minutes?: number | null;
  diet?: Diet | string | null;
  slug?: string;
  created_by?: ID | null;
}

/** —— Helpers —— */
export const toFullUrl = (p?: string, supabaseUrl?: string, assetBase?: string) => {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.replace(/^\/+/, '');
  if (/^storage\/v1\/object\/public\//i.test(clean)) {
    return supabaseUrl ? `${supabaseUrl}/${clean}` : '';
  }
  return assetBase ? `${assetBase}/${clean}` : '';
};

export function unwrapList<T = unknown>(resp: unknown, keys: string[] = ['data', 'items', 'dishes']): T[] {
  if (Array.isArray(resp)) return resp as T[];
  if (resp && typeof resp === 'object') {
    const anyResp = resp as any;
    for (const k of keys) {
      if (Array.isArray(anyResp[k])) return anyResp[k] as T[];
    }
  }
  return [];
}

export function unwrapOne<T = unknown>(resp: unknown, keys: string[] = ['data', 'item']): T | null {
  if (!resp) return null;
  if (Array.isArray(resp)) return (resp[0] as T) ?? null;
  if (typeof resp === 'object') {
    const anyResp = resp as any;
    for (const k of keys) {
      if (anyResp[k]) return anyResp[k] as T;
    }
    return anyResp as T;
  }
  return null;
}

export const formatRelativeTime = (dateStr?: string, now: Date = new Date()): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
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
};

/** —— Mappers —— */
export function mapDishBEToDish(
  d: DishBE,
  opts?: { supabaseUrl?: string; assetBase?: string }
): Dish {
  const cover = d.cover_image_url ? toFullUrl(d.cover_image_url, opts?.supabaseUrl, opts?.assetBase) : undefined;
  const images = cover ? [cover] : Array.isArray(d.images) ? d.images : [];
  return {
    id: d.id,
    name: d.title ?? d.name ?? '',
    slug: d.slug,
    images,
    description: d.description ?? d.tips ?? null,
    diet: d.diet ?? null,
    category: d.category ?? null,
    servings: d.servings ?? null,
    time_minutes: d.time_minutes ?? null,
    created_by: d.created_by ?? d.creator_id ?? d.user_id ?? null,
    created_at: d.created_at,
    updated_at: d.updated_at,
    // published: có thể suy từ status nếu BE trả về; để null nếu không chắc
    published: undefined as any,
  };
}

export function mapDishToCard(d: Dish, publishedFlag?: boolean, now: Date = new Date()): DishCard {
  const cover =
    d.images?.[0] ??
    'https://picsum.photos/400/300';

  // nếu không có flag truyền vào, suy bằng !!d.published
  const pub = typeof publishedFlag === 'boolean' ? publishedFlag : !!d.published;

  const updatedAt = pub
    ? d.created_at
      ? `Published ${formatRelativeTime(d.created_at, now)}`
      : 'Published'
    : d.updated_at
    ? `Edited ${formatRelativeTime(d.updated_at, now)}`
    : 'Draft';

  return {
    id: d.id,
    title: d.name,
    summary: d.description ?? '',
    cover,
    updatedAt,
    published: pub,
    category: d.category ?? null,
    servings: d.servings ?? null,
    time_minutes: d.time_minutes ?? null,
    diet: d.diet ?? null,
    slug: d.slug,
    created_by: d.created_by ?? null,
  };
}

/** —— Alias giữ tương thích tên cũ —— */
export type RecipePayload = DishInput;
export type Recipe = Dish;
export type DishItem = DishCard;
