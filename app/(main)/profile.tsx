import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';
import { useAuth } from '@/src/hooks/useAuth';
import { useGetChefQuery } from '@/src/api/chefsApi';
import { useGetChefDishesQuery } from '@/src/api/dishesApi';
import { clearApiKeyCache } from '@/src/api/baseApi';
import {
  ProfileHeader,
  StatsRow,
  BadgesSection,
  RecentRecipes,
} from '@/src/components/profile';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // Fetch chef profile
  const {
    data: chef,
    isLoading,
    error,
  } = useGetChefQuery(user?.id ?? '', {
    skip: !user?.id,
  });

  // Fetch chef's recent dishes
  const { data: chefDishes = [], isLoading: dishesLoading } =
    useGetChefDishesQuery(
      { chefId: user?.id ?? '', limit: 5 },
      { skip: !user?.id },
    );

  const signOut = React.useCallback(async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabaseNative.auth.signOut();
          clearApiKeyCache();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  }, [router]);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#f0fdf4', '#ffffff']}
          style={styles.gradientBg}
        >
          <View style={styles.center}>
            <View style={styles.loadingCircle}>
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
            <Text style={styles.loadingText}>
              {authLoading
                ? 'Checking authentication...'
                : 'Loading profile...'}
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#f0fdf4', '#ffffff']}
          style={styles.gradientBg}
        >
          <View style={styles.center}>
            <LinearGradient
              colors={['#dcfce7', '#f0fdf4']}
              style={styles.authIcon}
            >
              <Feather name="lock" size={56} color="#16a34a" />
            </LinearGradient>
            <Text style={styles.authTitle}>Authentication Required</Text>
            <Text style={styles.authHint}>
              Sign in to view and manage{'\n'}your chef profile
            </Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push('/(auth)/sign-in')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#16a34a', '#15803d']}
                style={styles.loginGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Feather name="log-in" size={20} color="#fff" />
                <Text style={styles.loginText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#fef2f2', '#ffffff']}
          style={styles.gradientBg}
        >
          <View style={styles.center}>
            <View style={styles.errorIcon}>
              <Feather name="alert-circle" size={56} color="#ef4444" />
            </View>
            <Text style={styles.errorTitle}>Failed to Load Profile</Text>
            <Text style={styles.errorHint}>
              Something went wrong.{'\n'}Please try again later.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={20} color="#16a34a" />
              <Text style={styles.retryText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Extract data
  const name = chef?.displayName ?? user?.email?.split('@')[0] ?? 'Chef';
  const avatar =
    chef?.avatarUrl ??
    'https://i.pinimg.com/1200x/f5/51/48/f55148ad2ef92de8597008b60bcd29a8.jpg';
  const bio = chef?.bio ?? 'No bio yet.';
  const role = chef?.verifiedAt ? 'Verified Chef' : 'Chef';

  const counts = {
    recipes: chefDishes.length,
    followers: chef?.totalRatings ?? 0,
    saved: 0,
  };

  const badges = chef?.verifiedAt
    ? [{ id: 'verified', name: 'Verified', icon: 'shield-check' }]
    : [];

  const recent = chefDishes.map((dish) => ({
    id: dish.id,
    title: dish.name,
    time_minutes: dish.time_minutes ?? undefined,
    cover_image_url: dish.images?.[0],
  }));

  const skills: string[] = [];

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
          location=""
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

        {/* Upgrade to Premium button */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(main)/premium')}
            style={styles.upgradeBtn}
          >
            <LinearGradient
              colors={['#f59e0b', '#ef4444']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeGradient}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.upgradeText}>Nâng cấp Premium</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Ratings Section */}
        {chef && chef.ratings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleRow}>
                <Ionicons name="star" size={20} color="#fbbf24" />
                <Text style={styles.sectionTitle}>
                  Reviews ({chef.averageRating?.toFixed(1)})
                </Text>
              </View>
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View all</Text>
                <Ionicons name="chevron-forward" size={16} color="#16a34a" />
              </TouchableOpacity>
            </View>

            {chef.ratings.slice(0, 3).map((rating, index) => (
              <View key={rating.id} style={styles.ratingCard}>
                <LinearGradient
                  colors={['#ffffff', '#fafafa']}
                  style={styles.ratingGradient}
                >
                  <View style={styles.ratingHeader}>
                    <View style={styles.starsContainer}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < rating.stars ? 'star' : 'star-outline'}
                          size={16}
                          color={i < rating.stars ? '#fbbf24' : '#d1d5db'}
                        />
                      ))}
                    </View>
                    <Text style={styles.ratingDate}>
                      {new Date(rating.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  {rating.comment && (
                    <Text style={styles.ratingComment} numberOfLines={3}>
                      "{rating.comment}"
                    </Text>
                  )}
                </LinearGradient>
              </View>
            ))}
          </View>
        )}

        <RecentRecipes
          recent={recent}
          isLoading={dishesLoading}
          onPressItem={(id) => {
            if (!id) return router.push('/(main)/myrecipe');
            router.push(`/recipe/${id}`);
          }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  gradientBg: { flex: 1 },
  container: { paddingBottom: 20 },

  // Center content
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // Loading
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
  },

  // Auth styles
  authIcon: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  authHint: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loginBtn: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  loginText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  // Error styles
  errorIcon: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  errorHint: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  retryText: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '700',
  },

  // Ratings Section
  section: { marginTop: 20, marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0b3b20',
    letterSpacing: -0.3,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
  },
  viewAllText: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 13,
  },

  // Rating Cards
  ratingCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingDate: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
  },
  ratingComment: {
    color: '#374151',
    lineHeight: 22,
    fontSize: 15,
    fontStyle: 'italic',
  },

  // Upgrade button
  upgradeBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  upgradeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
