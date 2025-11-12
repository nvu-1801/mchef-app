// src/hooks/useUserRole.ts
import { useEffect, useState } from 'react';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';

type Role = 'user' | 'chef' | 'admin' | null;

export function useUserRole(userId?: string | null) {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        if (!cancelled) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabaseNative
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (error) throw error;
        if (!cancelled) {
          setRole((data?.role as Role) ?? null);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setRole(null);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const canManage = role === 'chef' || role === 'admin';
  return { role, canManage, loading };
}
