// src/store/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setupListeners } from "@reduxjs/toolkit/query";

import auth from "../features/auth/authSlice";
import favorites from "../features/favorites/favoritesSlice";
import { dishesApi } from "../store/api/dishesApi"; // <-- import RTK Query API

const rootReducer = combineReducers({
  auth,
  favorites,
  [dishesApi.reducerPath]: dishesApi.reducer, // <-- thêm reducer
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "favorites"],          // Không cần persist cache API
  // hoặc dùng blacklist: ["dishesApi"]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(dishesApi.middleware),        // <-- thêm middleware
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Tùy chọn (refetchOnFocus/refetchOnReconnect)
setupListeners(store.dispatch);
