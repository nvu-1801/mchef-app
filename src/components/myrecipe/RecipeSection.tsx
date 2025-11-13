// src/components/myrecipe/RecipeSection.tsx
import { View, Text, StyleSheet } from 'react-native';
import { RecipeCard } from './RecipeCard';
import type { DishCard } from '@/src/types/dish';

type Props = {
  title?: string;
  recipes: DishCard[];
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
};

export function RecipeSection({ title, recipes, onDelete, onEdit }: Props) {
  if (!recipes || recipes.length === 0) return null;

  return (
    <View style={styles.section}>
      {!!title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}

      {recipes.map((r) => (
        <RecipeCard
          key={r.id}
          id={r.id}
          title={r.title}
          summary={r.summary}
          cover={r.cover}
          updatedAt={r.updatedAt}
          published={r.published}
          category={r.category}
          servings={r.servings}
          time_minutes={r.time_minutes}
          diet={r.diet}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 2 },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#2c2c2c' },
});
