// src/config/runtime.ts
import Constants from 'expo-constants';

type Extra = {
  EXPO_PUBLIC_API_URL?: string;
  EXPO_PUBLIC_INTERNAL_API_KEY?: string;
  EXPO_PUBLIC_DEBUG?: string | boolean;
};

const extra = (Constants?.expoConfig?.extra ??
               Constants?.manifest?.extra ?? {}) as Extra;

export const API_BASE_URL =
  (extra.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '') || 'http://10.0.2.2:4000/api';

export const INTERNAL_API_KEY = extra.EXPO_PUBLIC_INTERNAL_API_KEY || '';
export const IS_DEV = (__DEV__ || String(extra.EXPO_PUBLIC_DEBUG) === 'true');
