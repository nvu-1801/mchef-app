// src/modules/categories/useCategories.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';

export type Category = { id: string; name: string; slug: string };

export function useCategories() {
  const cancelRef = useRef(false);

  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchOnce = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: rows, error } = await supabaseNative
        .from('categories')
        .select('id, name, slug')
        .order('name', { ascending: true });

      if (error) throw error;
      if (!cancelRef.current) setData(rows ?? []);
    } catch (e) {
      if (!cancelRef.current) setError(e);
    } finally {
      if (!cancelRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cancelRef.current = false;
    fetchOnce();
    return () => {
      cancelRef.current = true;
    };
  }, [fetchOnce]);

  return { data, loading, error, refetch: fetchOnce };
}
