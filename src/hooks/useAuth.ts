import { useEffect, useState } from 'react';
import { supabaseNative } from '@/src/libs/supabase/supabase-native';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabaseNative.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        console.log('[useAuth] Initial session:', session ? 'exists' : 'null');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('[useAuth] Error getting session:', error);
        if (mounted) {
          setLoading(false);
        }
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseNative.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      console.log(
        '[useAuth] Auth state changed:',
        _event,
        session ? 'has session' : 'no session',
      );
      setSession(session);
      setUser(session?.user ?? null);
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
