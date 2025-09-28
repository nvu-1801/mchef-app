// src/auth/useAuthEffect.ts
import { useEffect } from "react";
import { supabaseNative } from "../libs/supabase/supabase-native";

export function useAuthEffect(onChange: (isLoggedIn: boolean) => void) {
  useEffect(() => {
    // kiểm tra phiên hiện tại khi app mở
    supabaseNative.auth.getSession().then(({ data }) => {
      onChange(!!data.session);
    });

    // lắng nghe thay đổi session
    const { data: sub } = supabaseNative.auth.onAuthStateChange((event, session) => {
      onChange(!!session);
    });

    return () => { sub.subscription.unsubscribe(); };
  }, [onChange]);
}
