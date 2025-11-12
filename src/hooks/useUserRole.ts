// src/hooks/useUserRole.ts
import { useEffect, useMemo, useState } from 'react';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';

type Role = 'user' | 'chef' | 'admin' | null;

export function useUserRole(userId?: string | null) {
  const uid = userId ?? null;

  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState<boolean>(!!uid);

  useEffect(() => {
    let cancelled = false;

    // Không có user -> reset state và thoát
    if (!uid) {
      setRole(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    (async () => {
      try {
        const { data, error } = await supabaseNative
          .from('profiles')
          .select('role')
          .eq('id', uid)
          .single();

        if (cancelled) return;
        if (error) {
          // có thể log error nếu cần
          setRole(null);
        } else {
          setRole((data?.role as Role) ?? null);
        }
      } catch {
        if (!cancelled) setRole(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const canManage = useMemo(
    () => role === 'chef' || role === 'admin',
    [role]
  );

  return { role, canManage, loading };
}
