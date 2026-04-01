import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServiceRole } from '../lib/supabase.js';
import { validateServerEnv } from '../lib/env-validator.js';

type AuthEvent =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_reset'
  | 'admin_sk_verify_toggle'
  | 'admin_trd_retry';

function cors(res: VercelResponse, origin: string | undefined): void {
  const allow = process.env.SERVER_ALLOWED_ORIGIN?.trim() || origin || '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function scrubEmail(email: string | undefined): string | undefined {
  if (!email) return undefined;
  const [local] = email.split('@');
  return `${local}@***`;
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

    const authHeader = req.headers.authorization;
    const token =
      typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : null;

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const sb = getSupabaseServiceRole();
    const { data: userData, error: userErr } = await sb.auth.getUser(token);
    if (userErr || !userData?.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const actorId = userData.user.id;

    let body: unknown = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body) as unknown;
      } catch {
        res.status(400).json({ error: 'Invalid JSON body' });
        return;
      }
    }

    const { event, userId, email, metadata } = (body ?? {}) as {
      event?: AuthEvent;
      userId?: string;
      email?: string;
      metadata?: Record<string, unknown>;
    };

    if (!event) {
      res.status(400).json({ error: 'event is required' });
      return;
    }

    const entityId = userId || actorId || 'anonymous';
    const baseMeta: Record<string, unknown> = {};
    const maskedEmail = scrubEmail(email);
    if (maskedEmail) baseMeta.email = maskedEmail;
    const mergedMeta =
      metadata && typeof metadata === 'object' ? { ...baseMeta, ...metadata } : baseMeta;

    await sb.from('audit_logs').insert({
      action: event,
      entity_type: 'auth',
      entity_id: entityId,
      actor_id: actorId,
      metadata: mergedMeta,
      created_at: new Date().toISOString(),
    });

    res.status(200).json({ logged: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    res.status(500).json({ error: msg });
  }
}

