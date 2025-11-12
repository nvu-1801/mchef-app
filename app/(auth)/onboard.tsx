import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/hooks/useAuth";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    key: "s1",
    title: "Discover Signature Dishes",
    subtitle:
      "Từ Phở, Bún Bò đến Pasta — bộ sưu tập công thức chọn lọc khiến bạn chỉ muốn vào bếp ngay.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop",
  },
  {
    key: "s2",
    title: "Cook Like a Pro",
    subtitle:
      "Bước-by-bước cùng ảnh minh hoạ rõ ràng. Bí kíp nấu ngon được cô đọng để bạn làm chủ hương vị.",
    image:
      "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?q=80&w=1600&auto=format&fit=crop",
  },
  {
    key: "s3",
    title: "Fresh, Fast & Fun",
    subtitle:
      "Công thức nhanh gọn 20–30 phút. Ăn lành mạnh, vị vẫn bùng nổ — hoàn hảo cho ngày bận rộn.",
    image:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
  },
];

export default function OnboardCarousel() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 🔒 TẤT CẢ HOOKS Ở TOP-LEVEL
  const listRef = useRef<FlatList<any>>(null);
  const [index, setIndex] = useState(0);
  const { isAuthenticated } = useAuth();

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    if (i !== index) setIndex(i);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      router.replace("/(main)/home");
    }
  };

  const Slide = ({ item }: { item: (typeof SLIDES)[number] }) => (
    <View style={{ width, height }}>
      {/* Hero */}
      <View style={styles.heroWrap}>
        <Image source={{ uri: item.image }} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.0)"]}
          style={styles.heroTopGlow}
        />
        <LinearGradient
          colors={["rgba(255,255,255,0.0)", "#ffffff"]}
          style={styles.heroFade}
        />
      </View>

      {/* Content card */}
      <View style={styles.body}>
        <Text style={styles.logo}>🥗</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>

        <View style={styles.actionsRow}>
          {/* Skip về home */}
          <Link href="/(main)/home" asChild>
            <Pressable style={styles.ghostBtn}>
              <Text style={styles.ghostText}>Skip</Text>
            </Pressable>
          </Link>

          {/* Next / Continue */}
          <Pressable style={styles.primaryBtn} onPress={goNext}>
            <Text style={styles.primaryText}>
              {index < SLIDES.length - 1 ? "Next" : "Continue"}
            </Text>
            <Ionicons
              name={index < SLIDES.length - 1 ? "chevron-forward" : "checkmark"}
              size={18}
              color="#fff"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const keyExtractor = (item: any) => item.key;

  // ✅ useMemo KHÔNG điều kiện
  const getItemLayout = useMemo(
    () => (_: any, i: number) => ({ length: width, offset: width * i, index: i }),
    []
  );

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: 0 }]}>
      {/* Nếu không đăng nhập → hiển thị màn yêu cầu login (không return sớm) */}
      {!isAuthenticated ? (
        <View style={styles.center}>
          <View style={styles.authIcon}>
            <Feather name="lock" size={48} color="#16a34a" />
          </View>
          <Text style={styles.authTitle}>Login Required</Text>
          <Text style={styles.authHint}>Please login to view your profile</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/(auth)/sign-in")}
            activeOpacity={0.9}
          >
            <Feather name="log-in" size={18} color="#fff" />
            <Text style={styles.loginText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Nút Skip nổi góc phải */}
          <View style={[styles.topBar, { top: insets.top + 8 }]}>
            <Link href="/(main)/home" asChild>
              <Pressable style={styles.topSkip} hitSlop={10}>
                <Text style={styles.topSkipText}>Skip</Text>
              </Pressable>
            </Link>
          </View>

          {/* Pager */}
          <FlatList
            ref={listRef}
            data={SLIDES}
            keyExtractor={keyExtractor}
            renderItem={Slide}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            getItemLayout={getItemLayout}
          />

          {/* Dots */}
          <View style={[styles.dotsWrap, { bottom: Math.max(18, insets.bottom + 12) }]}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  /* ---------- AUTH LOCK SCREEN ---------- */
  center: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  authIcon: {
    width: 84,
    height: 84,
    borderRadius: 16,
    backgroundColor: "#E7F8EC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  authTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  authHint: { fontSize: 14, textAlign: "center", color: "#6b7280" },
  loginBtn: {
    marginTop: 6,
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  loginText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  /* ---------- ONBOARD ---------- */
  topBar: { position: "absolute", right: 12, zIndex: 30 },
  topSkip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  topSkipText: { fontSize: 13, fontWeight: "700", color: "#111827" },

  heroWrap: {
    height: Math.min(460, height * 0.6),
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  heroImage: { position: "absolute", width: "100%", height: "100%" },
  heroTopGlow: { position: "absolute", left: 0, right: 0, top: 0, height: 160 },
  heroFade: { position: "absolute", left: 0, right: 0, bottom: -1, height: 200 },

  body: {
    marginTop: -24,
    marginHorizontal: 20,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 10,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  logo: { alignSelf: "center", fontSize: 40, marginTop: 6, marginBottom: 2 },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", color: "#111827" },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#6b7280",
    marginTop: 6,
    marginBottom: 10,
  },

  actionsRow: { flexDirection: "row", gap: 12, marginTop: 6 },
  ghostBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: { fontSize: 15, fontWeight: "700", color: "#111827" },
  primaryBtn: {
    flex: 1.2,
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryText: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "800" },

  dotsWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: "#E5E7EB" },
  dotActive: { width: 22, backgroundColor: "#2E7D32" },
});
