const REQUIRED_CLIENT_ENV = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
] as const;

export function validateClientEnv(): void {
  const missing = REQUIRED_CLIENT_ENV.filter((key) => {
    const env = import.meta.env as unknown as Record<string, string | undefined>;
    const v = env[key];
    return !v || !v.trim();
  });

  if (missing.length > 0) {
    const msg = `Missing required env vars: ${missing.join(', ')}`;
    const env = import.meta.env as unknown as { DEV?: boolean };
    if (env.DEV) {
      throw new Error(msg);
    }
    console.error('[SK] ' + msg);
  }

  const env = import.meta.env as unknown as Record<string, string | undefined>;
  const url = env.VITE_SUPABASE_URL;
  if (url && !url.startsWith('https://')) {
    console.error('[SK] VITE_SUPABASE_URL must use HTTPS');
  }
}

