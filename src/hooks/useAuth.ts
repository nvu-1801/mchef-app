// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabaseNative.auth.getSession();
        if (!mounted) return;
        console.log('[useAuth] Initial session:', data.session ? 'exists' : 'null');
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (e) {
        console.error('[useAuth] Error getting session:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: { subscription } } = supabaseNative.auth.onAuthStateChange((event, sess) => {
      if (!mounted) return;
      console.log('[useAuth] Auth state changed:', event, sess ? 'has session' : 'no session');
      setSession(sess ?? null);
      setUser(sess?.user ?? null);

      // In case INITIAL_SESSION comes after our manual getSession
      if (event === 'INITIAL_SESSION') setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    token: session?.access_token ?? null,
    loading,
    isAuthenticated: !!user,
  };
}
