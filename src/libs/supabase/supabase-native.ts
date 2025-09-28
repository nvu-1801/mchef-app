import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Lưu phiên dài hạn (Remember me = true). */
export const supabaseNative = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,               // lưu token ở AsyncStorage
      autoRefreshToken: true,
      persistSession: true,                // giữ phiên sau khi đóng app
      detectSessionInUrl: false,           // RN không có URL callback như web
    },
  }
);
