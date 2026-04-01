const REQUIRED_SERVER_ENV = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
] as const;

export function validateServerEnv(): void {
  const missing = REQUIRED_SERVER_ENV.filter((key) => {
    const v = process.env[key];
    return !v || !v.trim();
  });

  if (missing.length > 0) {
    throw new Error(`Server misconfigured. Missing: ${missing.join(', ')}`);
  }
}

export function inspectServerEnv(): { configured: string[]; missing: string[] } {
  const configured: string[] = [];
  const missing: string[] = [];
  for (const key of REQUIRED_SERVER_ENV) {
    const v = process.env[key];
    if (v && v.trim()) configured.push(key);
    else missing.push(key);
  }
  return { configured, missing };
}

