// // src/store/index.ts
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import { persistReducer, persistStore } from "redux-persist";
// import authReducer from "@/src/features/auth/auth.slice";
// import uiReducer from "@/src/features/ui/theme.slice";
// import { api } from "@/src/api/base";

// const rootReducer = combineReducers({
//   auth: authReducer,
//   ui: uiReducer,
//   [api.reducerPath]: api.reducer,
// });

// const persistConfig = {
//   key: "root",
//   storage: AsyncStorage,
//   whitelist: ["auth", "ui"], // cache RTK Query thường KHÔNG persist
// };

// const persisted = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persisted,
//   middleware: (gdm) => gdm({ serializableCheck: false }).concat(api.middleware),
// });

// export const persistor = persistStore(store);

// // typed
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
