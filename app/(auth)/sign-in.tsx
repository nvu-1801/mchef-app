import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabaseNative } from '../../src/libs/supabase/supabase-native';
import { supabaseEphemeral } from '../../src/libs/supabase/supabase-ephemeral';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleSignInButton from '../../src/components/common/GoogleSignInButton';

function humanize(message?: string) {
  const m = (message || '').toLowerCase();
  if (m.includes('invalid login credentials'))
    return 'Sai email hoặc mật khẩu.';
  if (m.includes('email not confirmed') || m.includes('not confirmed'))
    return 'Email chưa xác nhận. Vui lòng kiểm tra hộp thư.';
  if (m.includes('email provider disabled'))
    return 'Provider Email/Password đang bị tắt.';
  if (m.includes('captcha'))
    return 'Captcha đang bật. Tắt Captcha hoặc tích hợp hCaptcha.';
  return message || 'Có lỗi xảy ra.';
}

const APP_SCHEME = 'mchef';
const REDIRECT_URI = `${APP_SCHEME}://auth/callback`;

export default function SignInScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const canSubmit = email.trim().length > 3 && password.length >= 6;

  const onSubmit = async () => {
    try {
      setBusy(true);
      const sb = remember ? supabaseNative : supabaseEphemeral;
      const { error } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      router.replace('/(main)/home');
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', humanize(err?.message));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    try {
      setBusy(true);
      await AsyncStorage.setItem('oauth_remember', remember ? '1' : '0');

      // QUAN TRỌNG: luôn dùng native cho OAuth (để giữ code_verifier)
      const { data, error } = await supabaseNative.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'mchef://auth/callback',
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data?.url)
        throw new Error('Không nhận được URL đăng nhập từ Supabase.');

      await Linking.openURL(data.url); // mở Google → Supabase → deep link về app
    } catch (e: any) {
      Alert.alert('Google Sign-in', humanize(e?.message));
      await AsyncStorage.removeItem('oauth_remember');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>MChef</Text>
          <Text style={styles.subtitle}>
            Nơi khám phá và chia sẻ những công thức nấu ăn tuyệt vời.
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Sign In</Text>

          {/* Email */}
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

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputPwWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu của bạn"
                secureTextEntry={!showPw}
                style={[
                  styles.input,
                  { flex: 1, marginBottom: 0, borderWidth: 0 },
                ]}
              />
              <TouchableOpacity
                onPress={() => setShowPw((p) => !p)}
                hitSlop={8}
              >
                <Ionicons
                  name={showPw ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember me */}
          <Pressable
            style={styles.rememberRow}
            onPress={() => setRemember((v) => !v)}
          >
            <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
              {remember && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text>Ghi nhớ tôi</Text>
          </Pressable>

          {/* Submit */}
          <Pressable
            style={[styles.submitBtn, (!canSubmit || busy) && { opacity: 0.5 }]}
            disabled={!canSubmit || busy}
            onPress={onSubmit}
          >
            <Text style={styles.submitText}>
              {busy ? 'Đang xử lý...' : 'Đăng nhập'}
            </Text>
          </Pressable>

          {/* Google */}
          <GoogleSignInButton onPress={onGoogle} disabled={busy} />

          {/* Links */}
          <View style={{ height: 16 }} />
          <Link href="/forgot-password" asChild>
            <Pressable>
              <Text style={styles.linkMuted}>Quên mật khẩu?</Text>
            </Pressable>
          </Link>

          <View style={{ height: 8 }} />
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text style={styles.linkStrong}>Đăng ký</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const GREEN = '#2E7D32';

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 24, paddingHorizontal: 24 },
  logo: { fontSize: 28, fontWeight: '800', color: '#222', marginTop: 4 },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  content: { flex: 1, padding: 16, paddingTop: 18, gap: 12 },
  title: {
    textAlign: 'center',
    color: GREEN,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13, color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  inputPwWrap: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: GREEN, borderColor: GREEN },
  submitBtn: {
    marginTop: 10,
    backgroundColor: GREEN,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '700' },
  linkMuted: { textAlign: 'center', color: '#16a34a', opacity: 0.8 },
  linkStrong: { textAlign: 'center', color: '#16a34a', fontWeight: '700' },
});
