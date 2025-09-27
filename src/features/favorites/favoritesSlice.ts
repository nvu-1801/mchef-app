import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type FavoritesState = {
  items: string[]; // lưu danh sách dishId đã favorite
};

const initialState: FavoritesState = { items: [] };

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavorite(s, a: PayloadAction<{ dishId: string }>) {
      if (!s.items.includes(a.payload.dishId)) {
        s.items.push(a.payload.dishId);
      }
    },
    removeFavorite(s, a: PayloadAction<{ dishId: string }>) {
      s.items = s.items.filter((id) => id !== a.payload.dishId);
    },
    toggleFavorite(s, a: PayloadAction<{ dishId: string }>) {
      const id = a.payload.dishId;
      if (s.items.includes(id)) {
        s.items = s.items.filter((d) => d !== id);
      } else {
        s.items.push(id);
      }
    },
    clearFavorites(s) {
      s.items = [];
    },
  },
});

export const { addFavorite, removeFavorite, toggleFavorite, clearFavorites } =
  favoritesSlice.actions;

export default favoritesSlice.reducer;
