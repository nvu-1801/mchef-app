// // src/api/base.ts
// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import Constants from "expo-constants";

// const API_URL = Constants.expoConfig?.extra?.API_URL ?? "https://api.example.com";

// export const api = createApi({
//   reducerPath: "api",
//   baseQuery: fetchBaseQuery({
//     baseUrl: API_URL,
//     prepareHeaders: (headers, { getState }) => {
//       const token = (getState() as any)?.auth?.token;
//       if (token) headers.set("authorization", `Bearer ${token}`);
//       return headers;
//     },
//   }),
//   tagTypes: ["Recipe", "Chef", "Profile", "Bookmark"],
//   endpoints: () => ({}),
// });
