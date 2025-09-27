// app/(auth)/forgot-password.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";

// ❗️Nếu bạn dùng Supabase, bật dòng import này và trỏ đúng client của bạn
// import { supabase } from "@/libs/db/supabase/client";

const GREEN = "#2E7D32";

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canSubmit = /\S+@\S+\.\S+/.test(email);

  const onSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);

    try {
      // ===== Supabase (gợi ý) =====
      // const { error } = await supabase.auth.resetPasswordForEmail(email, {
      //   // Đặt deep link/app scheme của bạn (app.json -> scheme) hoặc web URL
      //   redirectTo: "mchef://reset-password",
      // });
      // if (error) throw error;

      // ===== Nếu chưa nối backend, tạm giả lập request =====
      await new Promise((r) => setTimeout(r, 900));

      setSent(true);
    } catch (e: any) {
      setError(e?.message ?? "Đã có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>MChef</Text>
          <Text style={styles.subtitle}>
            Nhập email để nhận liên kết đặt lại mật khẩu.
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Quên mật khẩu</Text>

          {!sent ? (
            <>
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="nhapemail@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                style={[styles.submitBtn, (!canSubmit || loading) && { opacity: 0.5 }]}
                onPress={onSubmit}
                disabled={!canSubmit || loading}
              >
                {loading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.submitText}>Gửi liên kết đặt lại</Text>
                )}
              </Pressable>

              <View style={{ height: 16 }} />

              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text style={styles.linkMuted}>Quay về đăng nhập</Text>
                </Pressable>
              </Link>
            </>
          ) : (
            <View style={{ alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: GREEN }}>
                Đã gửi email!
              </Text>
              <Text style={{ textAlign: "center", color: "#6b7280" }}>
                Kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
              </Text>

              <View style={{ height: 8 }} />
              <Pressable
                style={[styles.submitBtn, { paddingHorizontal: 18 }]}
                onPress={() => router.replace("/(auth)/sign-in")}
              >
                <Text style={styles.submitText}>Về trang đăng nhập</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingTop: 24, paddingHorizontal: 24 },
  logo: { fontSize: 28, fontWeight: "800", color: "#222", marginTop: 4 },
  subtitle: { textAlign: "center", color: "#6b7280", fontSize: 12, marginTop: 6, lineHeight: 18 },

  content: { flex: 1, padding: 16, paddingTop: 18, gap: 12 },
  title: { textAlign: "center", color: GREEN, fontSize: 22, fontWeight: "800", marginBottom: 8 },

  fieldWrap: { gap: 6 },
  label: { fontSize: 13, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },

  submitBtn: {
    marginTop: 10,
    backgroundColor: GREEN,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700" },
  linkMuted: { textAlign: "center", color: "#16a34a" },

  errorText: { color: "#dc2626", fontSize: 13 },
});
