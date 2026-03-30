/** Server-minted admin JWT-like token (HMAC-signed). */
export const ADMIN_TOKEN_KEY = 'sk_admin_token';

/**
 * G5: Client-side flag set only after MFA stub (replace with Supabase Auth `aal` / `session.mfa_verified`).
 * Super-Admin routes require both {@link ADMIN_TOKEN_KEY} and this key.
 */
export const ADMIN_MFA_SESSION_KEY = 'session_mfa_verified';

export function readAdminToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function isAdminMfaVerified(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_MFA_SESSION_KEY) === 'true';
}

export function setAdminMfaVerified(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(ADMIN_MFA_SESSION_KEY, 'true');
}

export function clearAdminSession(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_MFA_SESSION_KEY);
}
