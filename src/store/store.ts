// src/store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { dishesApi } from '../api/dishesApi';

const rootReducer = combineReducers({
  [dishesApi.reducerPath]: dishesApi.reducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // whitelist rỗng vì hiện chưa có slice nào cần persist,
  // nhưng để sẵn -> sau này chỉ cần thêm ['favorites', 'auth', ...]
  whitelist: [],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(dishesApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
