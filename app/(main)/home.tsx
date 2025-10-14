import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useListDishesQuery } from '@/src/api/dishesApi';
import Header from '../../src/components/home/Header';
import SearchBar from '../../src/components/home/SearchBar';
import FeaturedCarousel from '../../src/components/home/FeaturedCarousel';
import RecipeList from '../../src/components/home/RecipeList';
import CollectionsCarousel from '../../src/components/home/CollectionsCarousel';

const FEATURED = [
  {
    id: 'f1',
    title: 'Saffron Citrus Risotto',
    subtitle: 'Creamy arborio rice with bright notes of orange',
    image:
      'https://images.unsplash.com/photo-1546069901-eacef0df6022?w=900&h=700&fit=crop',
  },
  {
    id: 'f2',
    title: 'Umami Garden Bowl',
    subtitle: 'Roasted veggies with miso-maple glaze',
    image:
      'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=900&h=700&fit=crop',
  },
];

const WEEKLY_COLLECTION = [
  {
    id: 'w1',
    title: 'Lazy Sunday Brunch',
    recipes: 8,
    image:
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&h=700&fit=crop',
  },
  {
    id: 'w2',
    title: 'Glow Greens Detox',
    recipes: 6,
    image:
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&h=700&fit=crop',
  },
];

export default function MainScreen() {
  const { data = [], isLoading, error, refetch } = useListDishesQuery();

  // spotlight: first 3 dishes
  const spotlight = React.useMemo(
    () => (Array.isArray(data) ? data.slice(0, 3) : []),
    [data],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <SearchBar />

        <FeaturedCarousel items={FEATURED} loading={false} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Spotlight this week</Text>
          <Text style={styles.linkText}>See all</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginVertical: 12 }} />
        ) : null}
        {error && !data.length ? (
          <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
            <Text style={{ color: '#e11d48' }}>
              Không tải được spotlight. Chạm để thử lại
            </Text>
          </View>
        ) : null}

        <RecipeList data={spotlight} onRefresh={() => refetch()} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly collections</Text>
          <Text style={styles.linkText}>Browse</Text>
        </View>

        <CollectionsCarousel items={WEEKLY_COLLECTION} />

        <View style={{ height: 88 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fa' },
  container: { paddingBottom: 48 },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2c2c2c' },
  linkText: { color: '#2d9cdb', fontWeight: '600' },
});
