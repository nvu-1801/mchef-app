import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Props = {
  id: string;
  title: string;
  summary: string;
  cover: string;
  updatedAt: string;
  published: boolean;
  category?: { id?: string; name?: string } | null;
  servings?: number | null;
  time_minutes?: number | null;
  diet?: string | null;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
};

export function RecipeCard({
  id,
  title,
  summary,
  cover,
  updatedAt,
  published,
  category,
  servings,
  time_minutes,
  diet,
  onDelete,
  onEdit,
}: Props) {
  const router = useRouter();

  const handleEdit = () => {
    if (onEdit) return onEdit(id);
    router.push(`/(main)/chef/${id}`);
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      'Delete recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(id),
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push(published ? `/recipe/${id}` : `/(main)/chef/${id}`)
      }
    >
      <ImageBackground
        source={{ uri: cover }}
        style={styles.cover}
        imageStyle={styles.coverImage}
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {category?.name ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{category.name}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.summary} numberOfLines={2}>
          {summary || 'No description'}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons
            name={published ? 'time-outline' : 'pencil-outline'}
            size={14}
            color="#98a1b3"
          />
          <Text style={styles.meta}>{updatedAt}</Text>

          <View style={styles.metaSpacer} />

          {time_minutes != null && (
            <>
              <Ionicons name="time" size={14} color="#98a1b3" />
              <Text style={styles.metaSmall}>{` ${time_minutes}m`}</Text>
            </>
          )}

          {servings != null && (
            <>
              <Feather
                name="users"
                size={14}
                color="#98a1b3"
                style={{ marginLeft: 8 }}
              />
              <Text style={styles.metaSmall}>{` ${servings}`}</Text>
            </>
          )}

          {diet ? (
            <View
              style={[
                styles.dietPill,
                diet === 'veg' ? styles.veg : styles.nonveg,
              ]}
            >
              <Text style={styles.dietText}>
                {diet === 'veg' ? 'Veg' : 'Non-veg'}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { marginTop: 8 }]}
          onPress={handleEdit}
        >
          <Feather name="edit-2" size={16} color="#2d9cdb" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleDeleteConfirm}
        >
          <Feather name="trash-2" size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 14,
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cover: {
    width: 96,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 14,
    justifyContent: 'flex-end',
  },
  coverImage: { borderRadius: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 16,
  },
  body: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c2c2c',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#eef6f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: '#065f46', fontWeight: '700', fontSize: 12 },
  summary: { marginTop: 6, color: '#52606d', fontSize: 13, lineHeight: 18 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  meta: { marginLeft: 6, color: '#98a1b3', fontSize: 12 },
  metaSmall: { marginLeft: 4, color: '#98a1b3', fontSize: 12 },
  metaSpacer: { flex: 1 },
  actions: { marginLeft: 12, alignItems: 'flex-end' },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8faf8',
    marginTop: 6,
  },
  dietPill: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  veg: { backgroundColor: '#eef6f1' },
  nonveg: { backgroundColor: '#fff0f0' },
  dietText: { fontSize: 11, fontWeight: '700', color: '#065f46' },
});
