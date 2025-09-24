export type Chef = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  rating: number; // 1..5
  certificateVerified: boolean;
};

export type RecipeStep = { idx: number; content: string; imageUrl?: string; videoUrl?: string };
export type Ingredient = { name: string; unit?: string; amount?: number };

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  coverUrl?: string;
  chefId: string;
  category?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  avgRating?: number;
  totalRatings?: number;
  liked?: boolean;
  bookmarked?: boolean;
};
