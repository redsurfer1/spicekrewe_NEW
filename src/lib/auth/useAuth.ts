import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserOptional } from '../supabase';
import type { ProfileRow, SpiceKreweUser, UseAuthReturn } from './types';
import {
  AUTH_CHANGED_EVENT,
  readSpiceKreweUserFromStorage,
  resolveBuyerId,
  writeSpiceKreweUserToStorage,
} from './storage';

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
  void event;
  void userId;
  void email;
  void metadata;
}

function toSpiceKreweUser(user: User, profile: ProfileRow | null): SpiceKreweUser {
  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name,
    displayName: profile?.display_name,
    role: profile?.role ?? null,
    externalUserId: profile?.external_user_id ?? null,
  };
}

/**
 * Single source of truth for signed-in identity.
 * Mirrors the active Supabase session into `spicekrewe_auth_user` so concierge and API layers
 * never read ad hoc keys or env demo IDs.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [buyerId, setBuyerId] = useState<string | null>(() => resolveBuyerId(readSpiceKreweUserFromStorage()));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const supabase = getSupabaseBrowserOptional();

  const syncStorage = useCallback((u: User | null, p: ProfileRow | null) => {
    if (!u) {
      writeSpiceKreweUserToStorage(null);
      setBuyerId(null);
      return;
    }
    const sk = toSpiceKreweUser(u, p);
    writeSpiceKreweUserToStorage(sk);
    setBuyerId(resolveBuyerId(sk));
  }, []);

  useEffect(() => {
    const onExternal = () => setBuyerId(resolveBuyerId(readSpiceKreweUserFromStorage()));
    window.addEventListener(AUTH_CHANGED_EVENT, onExternal);
    window.addEventListener('storage', onExternal);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onExternal);
      window.removeEventListener('storage', onExternal);
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;
    let mounted = true;

    async function fetchProfile(userId: string): Promise<ProfileRow | null> {
      try {
        const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          return null;
        }
        return data as ProfileRow | null;
      } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
    }

    async function getSession() {
      try {
        const {
          data: { session },
        } = await client.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(p);
            syncStorage(session.user, p);
          }
        } else {
          setUser(null);
          setProfile(null);
          syncStorage(null, null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
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
          const p = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(p);
            syncStorage(session.user, p);
          }
        } else {
          setUser(null);
          setProfile(null);
          syncStorage(null, null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, syncStorage]);

  const signOut = async () => {
    if (!supabase) return;

    try {
      if (user) {
        logAuthEvent('logout', user.id, user.email ?? undefined);
      }
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      syncStorage(null, null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    profile,
    role: profile?.role || null,
    buyerId,
    loading,
    signOut,
  };
}
