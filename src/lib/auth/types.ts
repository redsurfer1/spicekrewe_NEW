import type { User } from '@supabase/supabase-js';

/** SpiceKrewe auth identity persisted to localStorage. Key: spicekrewe_auth_user */
export type SpiceKreweUser = {
  id: string;
  email: string;
  fullName?: string | null;
  displayName?: string | null;
  role?: 'admin' | 'buyer' | 'talent' | null;
  /** Optional external user ID. When present, used as buyerId instead of Supabase auth id. */
  externalUserId?: string | null;
};

export type ProfileRow = {
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
  /** Optional external system user ID (column `external_user_id` in Supabase). */
  external_user_id?: string | null;
};

export type UseAuthReturn = {
  user: User | null;
  profile: ProfileRow | null;
  role: 'admin' | 'buyer' | 'talent' | null;
  /** Single buyer id for concierge / marketplace APIs */
  buyerId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

export const SPICEKREWE_AUTH_STORAGE_KEY = 'spicekrewe_auth_user';
