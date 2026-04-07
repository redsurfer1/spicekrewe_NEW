import type { SpiceKreweUser } from './types';
import { SPICEKREWE_AUTH_STORAGE_KEY } from './types';

export const AUTH_CHANGED_EVENT = 'spicekrewe:auth-storage';

/**
 * SpiceKrewe auth identity storage.
 *
 * Storage key: 'spicekrewe_auth_user'
 * No legacy keys are read.
 * Users with stale localStorage data
 * will be prompted to sign in again.
 * This is the correct behavior after
 * a platform identity migration.
 */
export function readSpiceKreweUserFromStorage(): SpiceKreweUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SPICEKREWE_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SpiceKreweUser;
    if (parsed && typeof parsed.id === 'string' && parsed.id.length > 0) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeSpiceKreweUserToStorage(user: SpiceKreweUser | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(SPICEKREWE_AUTH_STORAGE_KEY);
  } else {
    localStorage.setItem(SPICEKREWE_AUTH_STORAGE_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

/**
 * Resolves buyer id from the object stored under `spicekrewe_auth_user`.
 * Returns externalUserId when set; otherwise the Supabase auth user id.
 */
export function resolveBuyerId(stored: SpiceKreweUser | null): string | null {
  if (!stored) return null;
  const externalId = stored.externalUserId?.trim();
  if (externalId) return externalId;
  return stored.id.trim() || null;
}
