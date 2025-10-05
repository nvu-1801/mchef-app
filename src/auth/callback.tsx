// app/auth/callback.tsx
import { useEffect } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabaseNative } from "../../src/libs/supabase/supabase-native";
import { supabaseEphemeral } from "../../src/libs/supabase/supabase-ephemeral";

const REDIRECT_URI = "mchef://auth/callback";

export default function AuthCallback() {
  const params = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      try {
        const errDesc = (params?.error_description as string) || "";
        if (errDesc) throw new Error(decodeURIComponent(errDesc));

        const code = (params?.code as string) || "";
        if (!code) throw new Error("Thiếu mã xác thực (code).");

        // 1) Exchange bằng NATIVE (nơi đang giữ code_verifier)
        // Thử cú pháp mới (>=2.43), nếu lỗi thì fallback cú pháp cũ
        try {
          const { error } = await (supabaseNative.auth as any).exchangeCodeForSession({
            authCode: code,
            redirectTo: REDIRECT_URI,
          });
          if (error) throw error;
        } catch {
          const { error } = await (supabaseNative.auth as any).exchangeCodeForSession(code);
          if (error) throw error;
        }

        // 2) Nếu KHÔNG remember ⇒ chuyển session sang EPHEMERAL rồi đăng xuất native
        const remember = (await AsyncStorage.getItem("oauth_remember")) === "1";
        await AsyncStorage.removeItem("oauth_remember");

        if (!remember) {
          const { data: s } = await supabaseNative.auth.getSession();
          const access_token = s?.session?.access_token;
          const refresh_token = s?.session?.refresh_token;

          if (!access_token || !refresh_token) throw new Error("Không lấy được session sau đăng nhập.");

          // setSession vào client ephemeral
          const { error: setErr } = await supabaseEphemeral.auth.setSession({
            access_token,
            refresh_token,
          });
          if (setErr) throw setErr;

          // đăng xuất ở native để không giữ phiên lâu
          await supabaseNative.auth.signOut();
        }

        router.replace("/(main)/home");
      } catch (e: any) {
        Alert.alert("Google Sign-in", e?.message || "Có lỗi xảy ra khi hoàn tất đăng nhập.");
        router.replace("/(auth)/sign-in");
      }
    })();
  }, [params]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <ActivityIndicator />
      <Text style={{ marginTop: 12 }}>Đang hoàn tất đăng nhập...</Text>
    </View>
  );
}
