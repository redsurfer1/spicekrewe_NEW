import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserOptional } from '../lib/supabase';

interface Profile {
  id: string;
  role: 'admin' | 'buyer' | 'talent';
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialty: string | null;
  hourly_rate: number | null;
  sk_verified: boolean;
  location: string | null;
  website_url: string | null;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  role: 'admin' | 'buyer' | 'talent' | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

type AuthEvent =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_reset'
  | 'admin_sk_verify_toggle'
  | 'admin_trd_retry';

function logAuthEvent(
  event: AuthEvent,
  userId?: string,
  email?: string,
  metadata?: Record<string, unknown>,
): void {
  void fetch('/api/auth-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, userId, email, metadata }),
  }).catch(() => {
    // Non-blocking: ignore failures.
  });
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const supabase = getSupabaseBrowserOptional();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;
    let mounted = true;

    async function getSession() {
      try {
        const {
          data: { session },
        } = await client.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function fetchProfile(userId: string) {
      try {
        const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (mounted && data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    void getSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      void (async () => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    if (!supabase) return;

    try {
      if (user) {
        logAuthEvent('logout', user.id, user.email ?? undefined);
      }
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    profile,
    role: profile?.role || null,
    loading,
    signOut,
  };
}
