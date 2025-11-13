// src/api/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';
import { API_BASE_URL, INTERNAL_API_KEY } from '@/src/config/runtime';

let cachedApiKey: string | null = null;
let cachedUserId: string | null = null;

async function getUserApiKey(
  userId: string,
  token: string,
): Promise<string | null> {
  if (cachedApiKey && cachedUserId === userId) return cachedApiKey;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/get-api-key`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!res.ok) {
      console.error('[getUserApiKey] Failed:', res.status);
      return null;
    }
    const json = await res.json();
    const apiKey = json?.apiKey || json?.data?.apiKey || null;

    cachedApiKey = apiKey;
    cachedUserId = userId;
    console.log('[getUserApiKey] fetched & cached for', userId.slice(0, 8));
    return apiKey;
  } catch (e) {
    console.error('[getUserApiKey] Error:', e);
    return null;
  }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  // parse JSON / text / 204
  responseHandler: async (response) => {
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) return response.json();
    if (response.status === 204) return null;
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },
});

function isFormData(body: any) {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

async function attachApiKey(args: string | FetchArgs): Promise<FetchArgs> {
  const argsObj: FetchArgs = typeof args === 'string' ? { url: args } : args;
  const headers = new Headers(argsObj.headers as HeadersInit);

  // Nếu body là FormData -> đừng set Content-Type
  const wantsJsonCT = !isFormData((argsObj as any).body);

  // Mode 1: INTERNAL KEY (dev/S2S)
  if (INTERNAL_API_KEY) {
    headers.set('x-api-key', INTERNAL_API_KEY);

    try {
      const {
        data: { session },
      } = await supabaseNative.auth.getSession();
      const userId = session?.user?.id;
      if (userId) headers.set('x-user-id', userId);
    } catch {}

    headers.set('Accept', 'application/json');
    if (wantsJsonCT) headers.set('Content-Type', 'application/json');

    console.log('[attachApiKey] using INTERNAL key');
    return { ...argsObj, headers };
  }

  // Mode 2: User API key
  const {
    data: { session },
  } = await supabaseNative.auth.getSession();
  const userId = session?.user?.id || null;
  const token = session?.access_token || null;

  if (!userId || !token) {
    console.warn('[attachApiKey] no supabase session -> cannot set x-api-key');
    return { ...argsObj, headers };
  }

  const apiKey = await getUserApiKey(userId, token);
  if (apiKey) {
    headers.set('x-api-key', apiKey);
    headers.set('x-user-id', userId);
    console.log('[attachApiKey] set user api key for', userId.slice(0, 8));
  } else {
    console.error('[attachApiKey] failed to obtain api key');
  }

  headers.set('Accept', 'application/json');
  if (wantsJsonCT) headers.set('Content-Type', 'application/json');

  return { ...argsObj, headers };
}

const baseQueryWithApiKey: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  try {
    const req = await attachApiKey(args);
    return await rawBaseQuery(req, api, extraOptions);
  } catch (err) {
    console.error('[baseQueryWithApiKey] EXCEPTION', err);
    return {
      error: { status: 'CUSTOM_ERROR', data: err } as FetchBaseQueryError,
    } as any;
  }
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithApiKey,
  tagTypes: ['Dishes', 'Categories', 'Profile', 'Chefs'], // Add 'Chefs'
  endpoints: () => ({}),
});

export function clearApiKeyCache() {
  cachedApiKey = null;
  cachedUserId = null;
  console.log('[BaseQuery] cache cleared');
}
