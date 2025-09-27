import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { apiFetch } from "@/src/libs/api";

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  description?: string;
};

type ProductsState = {
  items: Product[];
  status: "idle" | "loading" | "error";
  error?: string;
};
const initialState: ProductsState = { items: [], status: "idle" };

export const fetchProducts = createAsyncThunk<Product[], { q?: string } | void,
  { state: RootState }>("products/fetchAll", async (arg, thunkApi) => {
  const token = thunkApi.getState().auth.token ?? undefined;
  const q = arg?.q ? `?q=${encodeURIComponent(arg.q)}` : "";
  return await apiFetch<Product[]>(`/products${q}`, { token });
});

export const createProduct = createAsyncThunk<Product,
  Omit<Product, "id">, { state: RootState }>("products/create", async (body, { getState }) => {
  const token = getState().auth.token ?? undefined;
  return await apiFetch<Product>("/products", { method: "POST", body, token });
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => { s.status = "loading"; s.error = undefined; });
    b.addCase(fetchProducts.fulfilled, (s, a) => { s.status = "idle"; s.items = a.payload; });
    b.addCase(fetchProducts.rejected, (s, a) => { s.status = "error"; s.error = a.error.message; });
    b.addCase(createProduct.fulfilled, (s, a) => { s.items.unshift(a.payload); });
  },
});

export default productsSlice.reducer;
