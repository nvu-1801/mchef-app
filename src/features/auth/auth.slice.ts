// src/features/auth/auth.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  token: string | null;
  userId: string | null;
  email: string | null;
};
const initialState: AuthState = { token: null, userId: null, email: null };

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<{ token: string; userId: string; email: string }>) {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
    },
    clearSession() {
      return initialState;
    },
  },
});
export const { setSession, clearSession } = slice.actions;
export default slice.reducer;
