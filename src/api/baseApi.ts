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
  // 👇 Giữ để parse được cả JSON lẫn text
  responseHandler: async (response) => {
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) return response.json();
    if (response.status === 204) return null;
    const text = await response.text();
    try { return JSON.parse(text); } catch { return text; }
  },
  // Nếu backend dùng cookie phiên thì bật:
  // credentials: 'include',
});

// Helper: gắn Authorization header nếu có token
async function attachAuth(args: string | FetchArgs): Promise<FetchArgs> {
  const argsObj: FetchArgs = typeof args === 'string' ? { url: args } : args;
  const headers = new Headers(argsObj.headers as HeadersInit);

  const { data: { session }, error } = await supabaseNative.auth.getSession();
  if (error) console.log('[baseApi] getSession error:', error);
  const token = session?.access_token;

  if (token) headers.set('Authorization', `Bearer ${token}`);
  return { ...argsObj, headers };
}

const baseQueryWithSupabase: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args, api, extraOptions
) => {
  try {
    // 1) request lần 1 (đã gắn token nếu có)
    const req1 = await attachAuth(args);
    let res = await rawBaseQuery(req1, api, extraOptions);

    // 2) nếu 401 -> thử refresh token rồi bắn lại 1 lần
    if ('error' in res && res.error && res.error.status === 401) {
      console.log('[baseApi] 401 -> attempting refreshSession()');
      const { data, error } = await supabaseNative.auth.refreshSession();
      if (error) {
        console.log('[baseApi] refreshSession error:', error);
        return res; // vẫn trả 401
      }
      // có session mới -> retry
      const req2 = await attachAuth(args);
      res = await rawBaseQuery(req2, api, extraOptions);
    }

    return res;
  } catch (err) {
    console.log('[baseApi] EXCEPTION', err);
    return { error: { status: 'CUSTOM_ERROR', data: err } as FetchBaseQueryError } as any;
  }
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithSupabase,
  tagTypes: ['Dishes', 'Categories', 'Profile'],
  endpoints: () => ({}),
});
