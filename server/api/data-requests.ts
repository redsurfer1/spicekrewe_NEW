import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServiceRole } from '../lib/supabase.js';
import { validateServerEnv } from '../lib/env-validator.js';

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

  try {
    validateServerEnv();
  } catch (e) {
    res.status(500).json({ error: (e instanceof Error ? e.message : 'Server misconfigured') });
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

  const { email, full_name, request_type, description } = (body ?? {}) as {
    email?: string;
    full_name?: string;
    request_type?: string;
    description?: string;
  };

  if (!email || !full_name || !request_type) {
    res.status(400).json({ error: 'email, full_name, and request_type are required' });
    return;
  }

  try {
    const sb = getSupabaseServiceRole();
    const { error: insErr } = await sb.from('data_requests').insert({
      email,
      full_name,
      request_type,
      description,
    });
    if (insErr) {
      res.status(500).json({ error: insErr.message });
      return;
    }

    // TODO: Implement Resend-based notifications:
    // - Confirmation email to requester
    // - Admin notification to hello@spicekrewe.com

    res.status(200).json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    res.status(500).json({ error: msg });
  }
}

