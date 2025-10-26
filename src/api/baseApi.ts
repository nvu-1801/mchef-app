// src/api/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'https://mchef-be-m168.vercel.app/api',
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithSupabase: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  try {
    const { data: { session } } = await supabaseNative.auth.getSession();
    const token = session?.access_token;

    // Gắn token vào headers của request hiện tại
    const argsObj: FetchArgs = typeof args === 'string' ? { url: args } : args;
    const headers = new Headers(argsObj.headers as HeadersInit);

    if (token) headers.set('Authorization', `Bearer ${token}`);

    const nextArgs: FetchArgs = { ...argsObj, headers };
    return await rawBaseQuery(nextArgs, api, extraOptions);
  } catch (error) {
    // Tuỳ bạn log
    return { error: { status: 'CUSTOM_ERROR', data: error } as FetchBaseQueryError } as any;
  }
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithSupabase,
  tagTypes: ['Dishes', 'Categories', 'Profile'],
  endpoints: () => ({}),
});
