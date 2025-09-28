// src/libs/supabase/supabase-ephemeral.ts
import { createClient } from '@supabase/supabase-js';
import { MemoryStorage } from './memory-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client KHÔNG ghi nhớ phiên: đóng app là out.
 * Dùng khi người dùng KHÔNG tích "Remember me".
 */
export const supabaseEphemeral = createClient(url, anon, {
  auth: {
    storage: new MemoryStorage(),
    autoRefreshToken: true,
    persistSession: false,        // <-- quan trọng
    detectSessionInUrl: false,    // RN không có URL auth giống web
  },
});
