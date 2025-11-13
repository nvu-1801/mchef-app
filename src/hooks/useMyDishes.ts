// src/hooks/useMyDishes.ts
import React from 'react';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';
import { useListDishesQuery } from '@/src/api/dishesApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { Dish, DishCard, mapDishToCard } from '@/src/types/dish';

export function useMyDishes(passedUserId?: string | null) {
  // uid ưu tiên lấy từ prop; nếu không có thì sẽ tự đọc session
  const [uid, setUid] = React.useState<string | null>(passedUserId ?? null);

  // Đồng bộ khi prop thay đổi
  React.useEffect(() => {
    setUid(passedUserId ?? null);
  }, [passedUserId]);

  // Nếu không truyền userId, tự lấy từ Supabase session (một lần)
  React.useEffect(() => {
    if (passedUserId !== undefined) return; // đã có prop, khỏi fetch
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabaseNative.auth.getSession();
        const id = data?.session?.user?.id ?? null;
        if (mounted) setUid(id);
      } catch (e) {
        console.log('[useMyDishes] getSession error:', e);
        if (mounted) setUid(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [passedUserId]);

  // ✅ Hook RTK luôn được gọi; query bị skip khi chưa có uid
  const {
    data = [],
    isLoading,
    isFetching,
    refetch,
  } = useListDishesQuery(uid ? {} : skipToken);

  // Lọc theo owner phía client (nếu BE chưa lọc created_by)
  const myDishesRaw = React.useMemo(() => {
    if (!Array.isArray(data) || !uid) return [] as Dish[];
    return (data as Dish[]).filter((d) => d.created_by === uid);
  }, [data, uid]);

  const drafts: DishCard[] = React.useMemo(
    () =>
      myDishesRaw
        .filter((d) => !d.published)
        .slice(0, 50)
        .map((d) => mapDishToCard(d)),
    [myDishesRaw]
  );

  const published: DishCard[] = React.useMemo(
    () =>
      myDishesRaw
        .filter((d) => !!d.published)
        .slice(0, 50)
        .map((d) => mapDishToCard(d)),
    [myDishesRaw]
  );

  // Loading tổng hợp: đang fetch hoặc chưa xác định uid
  const loadingCombined = isLoading || isFetching || uid === null && passedUserId === undefined;

  return {
    myDishes: myDishesRaw,
    drafts,
    published,
    isLoading: loadingCombined,
    refetch,
  };
}
