import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';
import { useAuth } from '@/src/hooks/useAuth';
import {
  ProfileHeader,
  StatsRow,
  BadgesSection,
  RecentRecipes,
} from '@/src/components/profile';

type RawMe = Record<string, unknown>;

type NormalizedMe = {
  id?: string;
  name?: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  email?: string | null;
  counts?: {
    recipes?: number;
    followers?: number | string;
    saved?: number;
  };
  badges?: { id?: string; name?: string; icon?: string }[];
  recent_recipes?: {
    id?: string;
    title?: string;
    time_minutes?: number;
    cover_image_url?: string;
  }[];
  skills?: string[];
  role?: string;
};

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, token, loading: authLoading, isAuthenticated } = useAuth();

  const [me, setMe] = React.useState<NormalizedMe | null>(null);
  const [loading, setLoading] = React.useState(false);

  const normalize = (raw: RawMe): NormalizedMe => {
    const name =
      (raw.fullName as string) ??
      (raw.full_name as string) ??
      (raw.display_name as string) ??
      (raw.name as string) ??
      undefined;

    const avatarRaw =
      (raw.avatarUrl as string) ??
      (raw.avatar_url as string) ??
      (raw.avatar as string) ??
      null;
    const avatar = avatarRaw && avatarRaw.trim() !== '' ? avatarRaw : null;

    const bio = (raw.bio as string) ?? null;
    const location = (raw.location as string) ?? (raw.city as string) ?? null;
    const email = (raw.email as string) ?? null;

    const counts = (raw.counts as any) ?? {
      recipes: 0,
      followers: 0,
      saved: 0,
    };

    const badges = Array.isArray(raw.badges) ? (raw.badges as any[]) : [];
    const recent = Array.isArray(raw.recent_recipes)
      ? (raw.recent_recipes as any[])
      : Array.isArray(raw.recentRecipes)
        ? (raw.recentRecipes as any[])
        : [];

    const skills = Array.isArray(raw.skills) ? (raw.skills as string[]) : [];
    const role = (raw.role as string) ?? undefined;

    return {
      id: (raw.id as string) ?? undefined,
      name,
      avatar,
      bio,
      location,
      email,
      counts,
      badges,
      recent_recipes: recent.map((r) => ({
        id: r?.id,
        title: r?.title ?? r?.name,
        time_minutes: r?.time_minutes ?? r?.timeMinutes ?? undefined,
        cover_image_url: r?.cover_image_url ?? r?.coverImageUrl ?? r?.cover,
      })),
      skills,
      role,
    };
  };

  // Fetch profile data when authenticated
  React.useEffect(() => {
    if (!isAuthenticated || !token) {
      console.log('[Profile] Not authenticated, skipping fetch');
      return;
    }

    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        console.log('[Profile] Fetching profile with token');

        const headers: Record<string, string> = {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        };

        const res = await fetch('https://mchef-be-m168.vercel.app/api/me', {
          headers,
        });

        console.log('[Profile] Response status:', res.status);

        if (!mounted) return;

        if (res.status === 401) {
          console.log('[Profile] Token expired, signing out');
          await supabaseNative.auth.signOut();
          router.replace('/(auth)/sign-in');
          return;
        }

        if (!res.ok) {
          console.log('[Profile] Response not OK');
          setMe(null);
        } else {
          const json = (await res.json()) as unknown;
          console.log('[Profile] Response data:', json);

          if (typeof json === 'object' && json !== null) {
            const normalized = normalize(json as RawMe);
            console.log('[Profile] Normalized:', normalized);
            setMe(normalized);
          } else {
            console.log('[Profile] Invalid response format');
            setMe(null);
          }
        }
      } catch (e) {
        console.error('[Profile] Error:', e);
        setMe(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, token]);

  const signOut = React.useCallback(async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await supabaseNative.auth.signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  }, [router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <View style={styles.authIcon}>
            <Feather name="lock" size={48} color="#16a34a" />
          </View>
          <Text style={styles.authTitle}>Login Required</Text>
          <Text style={styles.authHint}>Please login to view your profile</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Feather name="log-in" size={18} color="#fff" />
            <Text style={styles.loginText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading while fetching profile
  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const name = me?.name ?? user?.email?.split('@')[0] ?? 'Chef';
  const avatar =
    me?.avatar ??
    `https://i.pinimg.com/1200x/f5/51/48/f55148ad2ef92de8597008b60bcd29a8.jpg`;
  const bio = me?.bio ?? 'No bio yet.';
  const location = me?.location ?? '';
  const counts = me?.counts ?? { recipes: 0, followers: 0, saved: 0 };
  const badges = Array.isArray(me?.badges) ? me!.badges! : [];
  const recent = Array.isArray(me?.recent_recipes) ? me!.recent_recipes! : [];
  const skills = Array.isArray(me?.skills) ? me!.skills! : [];
  const role = me?.role ?? '';

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          name={name}
          avatar={avatar}
          email={user?.email}
          location={location}
          role={role}
          bio={bio}
          skills={skills}
          onSettings={() => router.push('/settings')}
          onSignOut={signOut}
          onMyRecipes={() => router.push('/(main)/myrecipe')}
          onNew={() => router.push('/(main)/myrecipe')}
        />

        <StatsRow counts={counts} />

        <BadgesSection
          badges={badges}
          onViewAll={() => router.push('/badges')}
        />

        <RecentRecipes
          recent={recent}
          onPressItem={(id) => {
            if (!id) return router.push('/(main)/myrecipe');
            router.push(`/recipe/${id}`);
          }}
        />

        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0fdf4' },
  container: { paddingBottom: 36 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },

  // Auth styles
  authIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  authHint: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 28,
    gap: 10,
    shadowColor: '#16a34a',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 12,
  },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e6f6ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTop: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  titleCol: { flex: 1 },
  name: { fontSize: 20, fontWeight: '800', color: '#052e16' },
  email: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  locationText: { marginLeft: 6, color: '#6b7280' },
  roleText: { marginTop: 6, color: '#065f46', fontWeight: '700', fontSize: 12 },
  bio: { marginTop: 10, color: '#475569', lineHeight: 20 },
  skillsRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  skillChip: {
    backgroundColor: '#eef6f1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  skillText: { color: '#065f46', fontWeight: '700', fontSize: 12 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontWeight: '800', color: '#052e16', fontSize: 16 },
  statLabel: { color: '#6b7280', marginTop: 4, fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#d1fae5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ghostBtnText: { color: '#065f46', fontWeight: '700' },
  section: { marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0b3b20' },
  linkText: { color: '#16a34a', fontWeight: '700' },
  badgeRow: { paddingHorizontal: 16, paddingBottom: 8 },
  badgeCard: {
    width: 120,
    height: 96,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeLabel: {
    marginTop: 8,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    fontSize: 12,
  },
  recentCard: {
    width: 220,
    height: 140,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eef2f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  recentImage: { width: '100%', height: 86 },
  recentBody: { padding: 10 },
  recentTitle: { fontWeight: '800', color: '#0b3b20', fontSize: 14 },
  recentMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  recentTime: { marginLeft: 6, color: '#6b7280', fontSize: 12 },
  emptyRecent: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  emptyTitle: { fontWeight: '800', color: '#374151', marginTop: 8 },
  emptySub: { color: '#94a3b8', marginTop: 6 },
});
