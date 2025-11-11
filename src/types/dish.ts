// src/types/dish.ts

/** —— Enums & primitives —— */
export type ID = string;
export type Diet = 'veg' | 'nonveg';
export type PublishStatus = 'draft' | 'published'; // dùng cho UI nếu muốn suy luận từ 'published' boolean

/** —— Category Types (BE & App) —— */
export type CategoryBE = {
  id: string;
  icon?: string | null;
  name: string;
  slug?: string | null;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

/** —— Kiểu từ Backend (raw) —— */
export type DishImageBE = { image_url: string };

export type RatingBE = {
  stars: number;
  comment?: string | null;
  user_id?: string | null;
  created_at?: string | null;
};

export type IngredientBE = {
  amount?: number | null;
  note?: string | null;
  ingredient?: string | null;
};

export type RecipeStepBE = {
  step_no?: number | null;
  content?: string | null;
  image_url?: string | null;
};

export type CreatorBE = {
  id: string;
  avatar_url?: string | null;
  display_name?: string | null;
};

export type DishRatingStatsBE = {
  rating_avg: number;
  rating_count: number;
};

export type DishBE = {
  id: string;
  category_id?: string | null;
  title?: string | null;
  name?: string | null; // fallback
  slug?: string | null;
  cover_image_url?: string | null;
  description?: string | null;
  diet?: Diet | null;
  time_minutes?: number | null;
  servings?: number | null;
  review_status?: 'pending' | 'approved' | 'rejected' | null;
  created_by?: string | null;
  published?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;

  // detail
  tips?: string | null;
  video_url?: string | null;
  premium?: boolean | null;
  category?: CategoryBE | null;
  dish_images?: DishImageBE[] | null;
  dish_ingredients?: IngredientBE[] | null;
  recipe_steps?: RecipeStepBE[] | null;
  ratings?: RatingBE[] | null;
  dish_rating_stats?: DishRatingStatsBE[] | null;
  creator?: CreatorBE | null;
};

/** —— Kiểu "chuẩn hoá" trong app —— */
export type Rating = RatingBE;
export type Ingredient = IngredientBE;
export type RecipeStep = RecipeStepBE;
export type Creator = CreatorBE;

export type Dish = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  description?: string | null;
  diet: Diet | null;
  category: Category | null;
  servings?: number | null;
  time_minutes?: number | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;

  // trạng thái
  published: boolean;
  review_status?: DishBE['review_status'];

  // detail-only
  tips?: string | null;
  video_url?: string | null;
  premium?: boolean | null;
  ingredients?: Ingredient[] | null;
  steps?: RecipeStep[] | null;
  ratings?: Rating[] | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  creator?: Creator | null;
};

/** —— Payload gửi lên Backend —— */
export interface DishInput {
  title: string;
  description?: string;
  cover_image_url?: string;
  diet?: Diet | string;
  category_id?: string;
  servings?: number;
  time_minutes?: number;
  ingredients?: string[];   // text list
  instructions?: string[];  // text list
  status?: PublishStatus;   // nếu BE hỗ trợ, còn không có thì có thể bỏ
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
export const toFullUrl = (
  p?: string,
  supabaseUrl?: string,
  assetBase?: string,
) => {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.replace(/^\/+/, '');
  if (/^storage\/v1\/object\/public\//i.test(clean)) {
    return supabaseUrl ? `${supabaseUrl}/${clean}` : '';
  }
  return assetBase ? `${assetBase}/${clean}` : '';
};

export function unwrapList<T = unknown>(
  resp: unknown,
  keys: string[] = ['data', 'items', 'dishes'],
): T[] {
  if (Array.isArray(resp)) return resp as T[];
  if (resp && typeof resp === 'object') {
    const anyResp = resp as any;
    for (const k of keys) {
      if (Array.isArray(anyResp[k])) return anyResp[k] as T[];
    }
  }
  return [];
}

export function unwrapOne<T = unknown>(
  resp: unknown,
  keys: string[] = ['data', 'item', 'record'],
): T | null {
  if (!resp) return null;
  if (Array.isArray(resp)) return (resp[0] as T) ?? null;
  if (typeof resp === 'object') {
    const anyResp = resp as any;
    for (const k of keys) {
      if (anyResp[k] && typeof anyResp[k] === 'object' && !Array.isArray(anyResp[k])) {
        return anyResp[k] as T;
      }
    }
    return anyResp as T;
  }
  return null;
}

export const formatRelativeTime = (
  dateStr?: string,
  now: Date = new Date(),
): string => {
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
export function mapCategory(c: CategoryBE | null | undefined): Category | null {
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

function collectImages(
  d: DishBE,
  opts?: { supabaseUrl?: string; assetBase?: string },
): string[] {
  const cover = d.cover_image_url
    ? toFullUrl(d.cover_image_url, opts?.supabaseUrl, opts?.assetBase)
    : '';

  const others = (d.dish_images ?? [])
    .map((i) => i?.image_url)
    .filter((u): u is string => !!u)
    .map((u) => toFullUrl(u, opts?.supabaseUrl, opts?.assetBase));

  const arr = cover ? [cover, ...others] : others;
  return Array.from(new Set(arr));
}

/** Map từ DishBE -> Dish (chuẩn hoá, đủ dùng cho cả list/detail) */
export function mapDishBEToDish(
  d: DishBE,
  opts?: { supabaseUrl?: string; assetBase?: string },
): Dish {
  const images = collectImages(d, opts);

  const stats = d.dish_rating_stats?.[0];
  const name = d.title ?? d.name ?? '';

  return {
    id: d.id,
    name,
    slug: d.slug ?? '', // tránh undefined
    images,
    description: d.description ?? null,
    diet: d.diet ?? null,
    category: mapCategory(d.category),
    servings: d.servings ?? null,
    time_minutes: d.time_minutes ?? null,
    created_by: d.created_by ?? null,
    created_at: d.created_at ?? undefined,
    updated_at: d.updated_at ?? undefined,

    published: !!d.published,
    review_status: d.review_status ?? undefined,

    tips: d.tips ?? null,
    video_url: d.video_url ?? null,
    premium: d.premium ?? null,
    ingredients: d.dish_ingredients ?? null,
    steps: d.recipe_steps ?? null,
    ratings: d.ratings ?? null,
    rating_avg: stats?.rating_avg ?? (Array.isArray(d.ratings) && d.ratings.length
      ? d.ratings.reduce((a, r) => a + (r.stars || 0), 0) / d.ratings.length
      : null),
    rating_count: stats?.rating_count ?? (Array.isArray(d.ratings) ? d.ratings.length : null),
    creator: d.creator ?? null,
  };
}

/** Map Dish -> Card item cho UI list */
export function mapDishToCard(
  d: Dish,
  now: Date = new Date(),
): DishCard {
  const cover = d.images?.[0] ?? 'https://picsum.photos/400/300';
  const pub = !!d.published;

  const updatedAt = pub
    ? d.created_at
      ? `Published ${formatRelativeTime(d.created_at, now)}`
      : 'Published'
    : d.updated_at
      ? `Edited ${formatRelativeTime(d.updated_at, now)}`
      : 'Draft';

  return {
    id: d.id,
    title: d.name || d.slug || d.id,
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

/** —— Alias (nếu cần tương thích tên cũ) —— */
export type RecipePayload = DishInput;
export type Recipe = Dish;
export type DishItem = DishCard;
