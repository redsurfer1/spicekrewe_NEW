/**
 * Audit logger — SOC2 CC7.2 / ISO27001 A.12.4
 * Fire-and-forget — never blocks the response path.
 */

import type { VercelRequest } from '@vercel/node';
import { getSupabaseServiceRole } from './supabase.js';

export interface AuditEvent {
  eventType: string;
  actorId?: string;
  actorType: 'buyer' | 'provider' | 'admin' | 'system' | 'cron' | 'webhook';
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  payload?: Record<string, unknown>;
}

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    const sb = getSupabaseServiceRole();
    await sb.from('audit_log').insert({
      event_type: event.eventType,
      actor_id: event.actorId ?? 'unknown',
      actor_type: event.actorType,
      entity_type: event.entityType ?? null,
      entity_id: event.entityId ?? null,
      ip_address: event.ipAddress ?? null,
      user_agent: event.userAgent ?? null,
      payload: event.payload ?? {},
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auditLogger]', err);
  }
}

export function extractRequestMeta(req: VercelRequest): Pick<AuditEvent, 'ipAddress' | 'userAgent'> {
  const xf = req.headers['x-forwarded-for'];
  const forwarded = typeof xf === 'string' ? xf.split(',')[0]?.trim() : undefined;
  const realIp = req.headers['x-real-ip'];
  const ip = typeof realIp === 'string' ? realIp : forwarded;
  const ua = req.headers['user-agent'];
  return {
    ipAddress: ip,
    userAgent: typeof ua === 'string' ? ua : undefined,
  };
}
