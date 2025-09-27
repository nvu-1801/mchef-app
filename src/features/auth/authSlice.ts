import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "@/src/libs/api";

type User = { id: string; email: string; name?: string };
type AuthState = {
  token: string | null;
  user: User | null;
  status: "idle" | "loading" | "error";
  error?: string;
};

const initialState: AuthState = { token: null, user: null, status: "idle" };

export const signIn = createAsyncThunk<
  { token: string; user: User },
  { email: string; password: string }
>("auth/signIn", async (body) => {
  const data = await apiFetch<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body,
  });
  await AsyncStorage.setItem("access_token", data.token);
  return data;
});

export const signOut = createAsyncThunk("auth/signOut", async () => {
  await AsyncStorage.removeItem("access_token");
  return;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(signIn.pending, (s) => {
      s.status = "loading"; s.error = undefined;
    });
    b.addCase(signIn.fulfilled, (s, a) => {
      s.status = "idle";
      s.token = a.payload.token;
      s.user = a.payload.user;
    });
    b.addCase(signIn.rejected, (s, a) => {
      s.status = "error"; s.error = a.error.message;
    });
    b.addCase(signOut.fulfilled, (s) => {
      s.token = null; s.user = null;
    });
  },
});

export const { setToken } = authSlice.actions;
export default authSlice.reducer;
