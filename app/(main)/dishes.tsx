import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  View,
  Pressable,
  RefreshControl,
} from "react-native";
import { useListDishesQuery } from "@/src/store/api/dishesApi";
import { useAppDispatch, useAppSelector } from "../../src/hooks/hooks";
import { toggleFavorite } from "../../src/features/favorites/favoritesSlice";

export default function DishesScreen() {
  const { data = [], isLoading, isFetching, error, refetch } = useListDishesQuery();
  const dispatch = useAppDispatch();
  const favs = useAppSelector((s) => s.favorites.items);

  if (isLoading) return <ActivityIndicator />;

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ marginBottom: 8 }}>Không thể tải dữ liệu.</Text>
        <Pressable
          onPress={() => refetch()}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            alignSelf: "flex-start",
          }}
        >
          <Text>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(d) => d.id}
      contentContainerStyle={{ padding: 12 }}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      ListEmptyComponent={<Text style={{ padding: 16 }}>Không có món nào.</Text>}
      renderItem={({ item }) => {
        const isFav = favs.includes(item.id);
        const img = item.images?.[0];

        return (
          <View
            style={{
              marginBottom: 12,
              padding: 12,
              borderWidth: 1,
              borderRadius: 12,
            }}
          >
            {img ? (
              <Image
                source={{ uri: img }}
                style={{ width: "100%", height: 180, borderRadius: 10, marginBottom: 8 }}
                resizeMode="cover"
              />
            ) : null}

            <Text style={{ fontWeight: "700", fontSize: 16 }}>{item.name}</Text>

            {!!item.description && (
              <Text style={{ opacity: 0.8, marginTop: 6 }} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              {!!item.time_minutes && (
                <Text style={{ fontSize: 12, opacity: 0.7 }}>⏱ {item.time_minutes} phút</Text>
              )}
              {!!item.servings && (
                <Text style={{ fontSize: 12, opacity: 0.7 }}>🍽 {item.servings} suất</Text>
              )}
              {!!item.diet && (
                <Text style={{ fontSize: 12, opacity: 0.7 }}>
                  {item.diet === "veg" ? "🥗 Chay" : "🍖 Mặn"}
                </Text>
              )}
            </View>

            <Pressable
              onPress={() => dispatch(toggleFavorite({ dishId: item.id }))}
              style={{
                marginTop: 10,
                alignSelf: "flex-start",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
              }}
            >
              <Text>{isFav ? "💔 Unfavorite" : "❤️ Favorite"}</Text>
            </Pressable>
          </View>
        );
      }}
    />
  );
}
