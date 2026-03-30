import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

/**
 * Browser Supabase client (anon key + end-user JWT). Respects RLS.
 * Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (browserClient) return browserClient;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url?.trim() || !anon?.trim()) {
    throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
  }
  browserClient = createClient(url.trim(), anon.trim(), {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return browserClient;
}

/** Same as {@link getSupabaseBrowser} when env is configured; otherwise `null` (e.g. local dev without Supabase). */
export function getSupabaseBrowserOptional(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url?.trim() || !anon?.trim()) {
    return null;
  }
  return getSupabaseBrowser();
}
