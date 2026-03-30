import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mintAdminToken } from '../../server/lib/admin-token';

function cors(res: VercelResponse, origin: string | undefined): void {
  const allow = process.env.SERVER_ALLOWED_ORIGIN?.trim() || origin || '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  cors(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!adminPassword || !sessionSecret) {
    res.status(503).json({ error: 'Admin authentication is not configured on the server' });
    return;
  }

  let body: unknown = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body) as unknown;
    } catch {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }
  }

  const pw =
    body &&
    typeof body === 'object' &&
    body !== null &&
    'password' in body &&
    typeof (body as { password?: unknown }).password === 'string'
      ? (body as { password: string }).password
      : '';

  if (pw !== adminPassword) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  try {
    const token = mintAdminToken();
    res.status(200).json({
      token,
      expiresInSeconds: 8 * 60 * 60,
      role: 'super_admin',
      mfaRequired: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Token error';
    res.status(500).json({ error: msg });
  }
}
