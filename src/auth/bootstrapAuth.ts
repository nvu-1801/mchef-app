// src/auth/bootstrapAuth.ts
import { supabaseNative } from '../libs/supabase/supabase-native'; // nếu bạn có client remember
import { setAuthToken } from './tokenBridge';

export function bootstrapAuthListener() {
  // lấy session ban đầu
  supabaseNative.auth.getSession().then(({ data }) => {
    setAuthToken(data.session?.access_token ?? null);
  });

  // lắng nghe đổi phiên
  const { data: sub } = supabaseNative.auth.onAuthStateChange((_event, session) => {
    setAuthToken(session?.access_token ?? null);
  });

  return () => sub.subscription.unsubscribe();
}
