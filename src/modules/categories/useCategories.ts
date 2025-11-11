// src/modules/categories/useCategories.ts
import { useEffect, useState } from 'react';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';

export type Category = { id: string; name: string; slug: string };

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabaseNative
          .from('categories')
          .select('id, name, slug')
          .order('name', { ascending: true });
        if (error) throw error;
        setData(data ?? []);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}
