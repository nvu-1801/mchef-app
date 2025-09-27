import React from 'react';
import {
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useListDishesQuery } from '@/src/api/dishesApi';
import { useAppDispatch, useAppSelector } from '../../src/hooks/hooks';
import { toggleFavorite } from '../../src/features/favorites/favoritesSlice';

type Feature = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

type Recipe = {
  id: string;
  title: string;
  chef: string;
  time: string;
  rating: number;
  image: string;
};

const FEATURED: Feature[] = [
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

const SPOTLIGHT: Recipe[] = [
  {
    id: 's1',
    title: 'Charred Corn Coconut Soup',
    chef: 'Sophia Nguyen',
    time: '35 min',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=900&h=700&fit=crop',
  },
  {
    id: 's2',
    title: 'Herbal Infusion Salad',
    chef: 'Amelia Tran',
    time: '20 min',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900&h=700&fit=crop',
  },
  {
    id: 's3',
    title: 'Wild Mushroom Tartine',
    chef: 'Theo Laurent',
    time: '25 min',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=700&fit=crop',
  },
];

const CATEGORIES = [
  { id: 'c1', label: 'Quick' },
  { id: 'c2', label: 'Plant-based' },
  { id: 'c3', label: 'Comfort' },
  { id: 'c4', label: 'Seasonal' },
  { id: 'c5', label: 'Meal prep' },
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

  // pick 3 random dishes (ổn định trong vòng đời của data)
  const spotlight = React.useMemo(() => {
    if (!data?.length) return [];
    const arr = [...data];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 3);
  }, [data]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.headerTitle}>MChef Daily</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="bookmark" size={20} color="#2d9cdb" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#2d9cdb"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchRow}>
          <Ionicons
            name="search"
            size={20}
            color="#8895a7"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Tim kiem cong thuc, dau bep..."
            style={styles.searchInput}
            placeholderTextColor="#98a1b3"
          />
          <TouchableOpacity style={styles.filterBtn}>
            <MaterialIcons name="filter-list" size={22} color="#2d9cdb" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                index === 0 && styles.categoryChipActive,
              ]}
            >
              <Text
                style={
                  index === 0
                    ? styles.categoryChipTextActive
                    : styles.categoryChipText
                }
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featureRow}
        >
          {FEATURED.map((item) => (
            <ImageBackground
              key={item.id}
              source={{ uri: item.image }}
              style={styles.featureCard}
            >
              <View style={styles.featureOverlay} />
              <View style={styles.featureContent}>
                <Text style={styles.featureSubtitle}>Featured</Text>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDescription}>{item.subtitle}</Text>
                <TouchableOpacity style={styles.featureBtn}>
                  <Text style={styles.featureBtnText}>Cook now</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Spotlight this week</Text>
          <Link href="/recipe/dishes" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>See all</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Spotlight content (dùng styles.recipeCard) */}
        {isLoading && (
          <ActivityIndicator
            style={{ marginHorizontal: 20, marginBottom: 12 }}
          />
        )}

        {error && (
          <TouchableOpacity
            onPress={() => refetch()}
            style={{ marginHorizontal: 20, marginBottom: 12 }}
          >
            <Text style={{ color: '#e11d48' }}>
              Không tải được spotlight. Thử lại
            </Text>
          </TouchableOpacity>
        )}

        {(spotlight.length ? spotlight : []).map((item) => (
          <TouchableOpacity key={item.id} style={styles.recipeCard}>
            <Image
              source={{
                uri:
                  item.images?.[0] ??
                  'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=900&h=700&fit=crop',
              }}
              style={styles.recipeImage}
            />
            <View style={styles.recipeBody}>
              <Text style={styles.recipeTitle}>{item.name}</Text>
              <Text style={styles.recipeChef}>
                {item.category?.name ?? 'MChef'}
              </Text>

              <View style={styles.recipeMetaRow}>
                <View style={styles.recipeMetaItem}>
                  <Ionicons name="time-outline" size={16} color="#98a1b3" />
                  <Text style={styles.recipeMetaText}>
                    {item.time_minutes ?? 30} min
                  </Text>
                </View>

                <View style={styles.recipeMetaItem}>
                  <Ionicons
                    name={
                      item.diet === 'veg'
                        ? 'leaf-outline'
                        : 'restaurant-outline'
                    }
                    size={16}
                    color="#98a1b3"
                  />
                  <Text style={styles.recipeMetaText}>
                    {item.diet === 'veg' ? 'Veg' : 'Non-veg'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.recipeSaveBtn}>
              <Feather name="bookmark" size={18} color="#2d9cdb" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly collections</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Browse</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collectionRow}
        >
          {WEEKLY_COLLECTION.map((collection) => (
            <TouchableOpacity key={collection.id} style={styles.collectionCard}>
              <Image
                source={{ uri: collection.image }}
                style={styles.collectionImage}
              />
              <View style={styles.collectionBody}>
                <Text style={styles.collectionTitle}>{collection.title}</Text>
                <Text style={styles.collectionMeta}>
                  {collection.recipes} recipes
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fa' },
  container: { paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  eyebrow: { color: '#98a1b3', fontSize: 13, fontWeight: '500' },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2c2c2c',
    marginTop: 2,
  },
  headerActions: { flexDirection: 'row' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e6f3fb',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#eef2f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2c2c2c',
    paddingVertical: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  categoryRow: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#2d9cdb',
    borderColor: '#2d9cdb',
  },
  categoryChipText: { color: '#52606d', fontWeight: '600' },
  categoryChipTextActive: { color: '#fff', fontWeight: '600' },
  featureRow: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  featureCard: {
    width: 280,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
    justifyContent: 'flex-end',
  },
  featureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21, 26, 34, 0.35)',
  },
  featureContent: { padding: 18 },
  featureSubtitle: { color: '#d0e6ff', fontSize: 13, fontWeight: '600' },
  featureTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  featureDescription: {
    color: '#f5f7fa',
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  featureBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: '#ff7a59',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  featureBtnText: { color: '#fff', fontWeight: '600' },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2c2c2c' },
  linkText: { color: '#2d9cdb', fontWeight: '600' },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  recipeImage: { width: 84, height: 84, borderRadius: 16, marginRight: 14 },
  recipeBody: { flex: 1 },
  recipeTitle: { fontSize: 16, fontWeight: '700', color: '#2c2c2c' },
  recipeChef: { marginTop: 4, color: '#8895a7', fontSize: 13 },
  recipeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  recipeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  recipeMetaText: { marginLeft: 6, color: '#52606d', fontSize: 13 },
  recipeSaveBtn: { padding: 6 },
  collectionRow: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  collectionCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  collectionImage: { width: '100%', height: 110 },
  collectionBody: { padding: 12 },
  collectionTitle: { fontSize: 14, fontWeight: '700', color: '#2c2c2c' },
  collectionMeta: { marginTop: 4, color: '#8895a7', fontSize: 12 },
  bottomPadding: { height: 80 },
});
