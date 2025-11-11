// src/hooks/useUserRole.ts
import { useEffect, useState } from 'react';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';
import { useAuth } from '@/src/hooks/useAuth';

type Role = 'user' | 'chef' | 'admin' | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // chưa có user => set mặc định rồi thoát (nhưng KHÔNG dừng hook!)
      if (!user?.id) {
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
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (!cancelled) {
          const r = (data?.role as Role) ?? null;
          setRole(r);
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
    return () => { cancelled = true; };
  }, [user?.id]);

  const canManage = role === 'chef' || role === 'admin';
  return { role, canManage, loading };
}
