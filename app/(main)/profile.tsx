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
  const [me, setMe] = React.useState<NormalizedMe | null>(null);
  const [loading, setLoading] = React.useState(true);

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

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Get session from Supabase
        const { data: sessionData, error: sessionError } =
          await supabaseNative.auth.getSession();

        console.log(
          '[Profile] Session:',
          sessionData?.session ? 'exists' : 'null',
        );

        if (sessionError || !sessionData?.session) {
          console.log('[Profile] No session found, redirecting to login');
          if (mounted) {
            setLoading(false);
            router.replace('/(auth)/sign-in');
          }
          return;
        }

        const token = sessionData.session.access_token;
        console.log('[Profile] Token from session:', token ? 'exists' : 'null');

        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        console.log('[Profile] Calling /api/me...');

        const res = await fetch('https://mchef-be-m168.vercel.app/api/me', {
          headers,
        });

        console.log('[Profile] Response status:', res.status);

        if (!mounted) return;

        if (res.status === 401) {
          console.log('[Profile] Token expired/invalid, clearing session');
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
        console.log('[Profile] Error:', e);
        setMe(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  const name = me?.name ?? 'Chef';
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
        <LinearGradient
          colors={['#e6f8f0', '#ffffff']}
          style={styles.headerGradient}
        >
          <View style={styles.headerInner}>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.iconBtn}
            >
              <Ionicons name="settings-outline" size={20} color="#065f46" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={signOut}
              style={[styles.iconBtn, { backgroundColor: '#fff0f0' }]}
            >
              <Feather name="log-out" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileTop}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={styles.titleCol}>
              <Text style={styles.name}>{name}</Text>
              {!!location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#6b7280" />
                  <Text style={styles.locationText}>{location}</Text>
                </View>
              )}
              {!!role && (
                <Text
                  style={{ marginTop: 6, color: '#065f46', fontWeight: '700' }}
                >
                  {role.toUpperCase()}
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.bio} numberOfLines={3}>
            {bio}
          </Text>

          <View style={styles.skillsRow}>
            {skills.slice(0, 4).map((s) => (
              <View key={s} style={styles.skillChip}>
                <Text style={styles.skillText}>{s}</Text>
              </View>
            ))}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{counts.recipes ?? 0}</Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{counts.followers ?? 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{counts.saved ?? 0}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => router.push('/(main)/chef')}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Manage my recipes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(main)/chef/new')}
              style={styles.ghostBtn}
            >
              <Text style={styles.ghostBtnText}>New recipe</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <TouchableOpacity onPress={() => router.push('/badges')}>
              <Text style={styles.linkText}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeRow}
          >
            {badges.length === 0 ? (
              <View style={styles.badgeEmpty}>
                <MaterialCommunityIcons
                  name="emoticon-neutral"
                  size={28}
                  color="#94a3b8"
                />
                <Text style={styles.badgeEmptyText}>No badges yet</Text>
              </View>
            ) : (
              badges.map((b) => (
                <View key={b.id ?? b.name} style={styles.badgeCard}>
                  <MaterialCommunityIcons
                    name={(b.icon as any) ?? 'star'}
                    size={26}
                    color="#ff8a65"
                  />
                  <Text style={styles.badgeLabel}>{b.name}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent recipes</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/dishes')}>
              <Text style={styles.linkText}>See all</Text>
            </TouchableOpacity>
          </View>

          {recent.length === 0 ? (
            <View style={styles.emptyRecent}>
              <Ionicons
                name="document-text-outline"
                size={40}
                color="#cbd5e1"
              />
              <Text style={styles.emptyTitle}>No recent recipes</Text>
              <Text style={styles.emptySub}>
                Publish a recipe to see it here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={recent}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16 }}
              keyExtractor={(i, idx) => i.id ?? i.title ?? `recent-${idx}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/recipe/${item.id}`)}
                  style={styles.recentCard}
                >
                  <Image
                    source={{
                      uri:
                        item.cover_image_url ?? 'https://picsum.photos/320/220',
                    }}
                    style={styles.recentImage}
                  />
                  <View style={styles.recentBody}>
                    <Text style={styles.recentTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.recentMeta}>
                      <Ionicons name="time-outline" size={14} color="#6b7280" />
                      <Text style={styles.recentTime}>
                        {item.time_minutes ?? '-'} min
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc' },
  container: { paddingBottom: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  locationText: { marginLeft: 6, color: '#6b7280' },
  bio: { marginTop: 10, color: '#475569', lineHeight: 20 },
  skillsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
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
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  ghostBtn: {
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  badgeEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  badgeEmptyText: { color: '#94a3b8', marginLeft: 8 },
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
