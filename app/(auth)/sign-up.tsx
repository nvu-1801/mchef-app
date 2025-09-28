// app/(auth)/sign-up.tsx
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
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SignUp() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [showPw2, setShowPw2] = React.useState(false);

  const canSubmit =
    name.trim().length > 1 &&
    email.trim().length > 3 &&
    password.length >= 6 &&
    confirm === password;

  const onSubmit = async () => {
    // TODO: call your sign-up API here
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>MChef</Text>
          <Text style={styles.subtitle}>Tạo tài khoản để bắt đầu nấu món yêu thích!</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Sign Up</Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nhập họ tên của bạn"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Nhập email của bạn"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputPwWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Tối thiểu 6 ký tự"
                secureTextEntry={!showPw}
                style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
              />
              <Pressable onPress={() => setShowPw((s) => !s)} hitSlop={8}>
                <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={22} />
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={styles.inputPwWrap}>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Nhập lại mật khẩu"
                secureTextEntry={!showPw2}
                style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
              />
              <Pressable onPress={() => setShowPw2((s) => !s)} hitSlop={8}>
                <Ionicons name={showPw2 ? "eye-off-outline" : "eye-outline"} size={22} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.submitBtn, !canSubmit && { opacity: 0.5 }]}
            disabled={!canSubmit}
            onPress={onSubmit}
          >
            <Text style={styles.submitText}>Tạo tài khoản</Text>
          </Pressable>

          <View style={{ height: 12 }} />
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text style={styles.linkMuted}>Đã có tài khoản? Đăng nhập</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const GREEN = "#2E7D32";

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
  inputPwWrap: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
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
});
