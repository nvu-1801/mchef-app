// src/features/favorites/favoritesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FavoriteEntry = {
  id: string;
  name?: string;
  image?: string | null;
  slug?: string;
  categoryName?: string | null;
  time_minutes?: number | null;
  diet?: string | null;
};

type FavoritesState = {
  order: string[];
  entities: Record<string, FavoriteEntry>;
  // @deprecated: items? để migrate
  items?: string[];
};

const initialState: FavoritesState = { order: [], entities: {} };

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<FavoriteEntry>) {
      const p = action.payload;
      // ✅ guard state luôn có cấu trúc hợp lệ
      if (!state.entities) state.entities = {};
      if (!state.order) state.order = [];

      // ✅ migrate từ state cũ (items: string[]) nếu còn
      if (Array.isArray((state as any).items) && state.order.length === 0) {
        const old = (state as any).items as string[];
        state.order = [...old];
        for (const id of old) {
          if (!state.entities[id]) state.entities[id] = { id };
        }
        delete (state as any).items;
      }

      if (!p || !p.id) return;

      if (state.entities[p.id]) {
        delete state.entities[p.id];
        state.order = state.order.filter((x) => x !== p.id);
      } else {
        state.entities[p.id] = p;
        // tránh duplicate
        state.order = [p.id, ...state.order.filter((x) => x !== p.id)];
      }
    },
    clearFavorites(state) {
      state.order = [];
      state.entities = {};
    },
  },
});

export const { toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;

// Selectors
export const selectIsFav =
  (id: string) =>
  (s: any) =>
    Boolean(s?.favorites?.entities && s.favorites.entities[id]);

export const selectFavoriteEntries = (s: any) => {
  const f = s?.favorites;
  const order: string[] = Array.isArray(f?.order) ? f.order : [];
  const ents: Record<string, FavoriteEntry> = f?.entities ?? {};
  // lọc undefined phòng trường hợp lệch dữ liệu
  return order.map((id) => ents[id]).filter(Boolean) as FavoriteEntry[];
};
