// hooks/useMyDishes.ts
import React from 'react';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';
import { useListDishesQuery } from '@/src/api/dishesApi';
import { Dish, DishCard, mapDishToCard } from '@/src/types/dish';

export function useMyDishes() {
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const { data = [], isLoading, refetch } = useListDishesQuery();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: sessionData } = await supabaseNative.auth.getSession();
        const id = sessionData?.session?.user?.id ?? null;
        if (mounted) setCurrentUserId(id);
      } catch (e) {
        console.log('[useMyDishes] Error getting user:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const myDishesRaw = React.useMemo(() => {
    if (!Array.isArray(data) || !currentUserId) return [] as Dish[];
    return (data as Dish[]).filter((d) => d.created_by === currentUserId);
  }, [data, currentUserId]);

  const drafts: DishCard[] = React.useMemo(() => {
    return myDishesRaw
      .filter((d) => !d.published) // hoặc suy theo status khác nếu có
      .slice(0, 50)
      .map((d) => mapDishToCard(d, false));
  }, [myDishesRaw]);

  const published: DishCard[] = React.useMemo(() => {
    return myDishesRaw
      .filter((d) => !!d.published)
      .slice(0, 50)
      .map((d) => mapDishToCard(d, true));
  }, [myDishesRaw]);

  return {
    myDishes: myDishesRaw,
    drafts,
    published,
    isLoading: isLoading || !currentUserId,
    refetch,
  };
}
