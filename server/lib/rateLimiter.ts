/**
 * Rate limiter — SOC2 CC6.6 / ISO27001 A.13.1
 * Tracks per-key request counts in `rate_limit_events` (service role).
 * Fail-open on errors.
 */

import type { VercelRequest } from '@vercel/node';
import { getSupabaseServiceRole } from './supabase.js';
import { logSecurityIncident } from './securityIncidents.js';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(key: string, maxRequests: number, windowMinutes: number): Promise<RateLimitResult> {
  const resetAt = new Date();
  resetAt.setMinutes(resetAt.getMinutes() + windowMinutes);

  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

  try {
    const sb = getSupabaseServiceRole();
    const { count, error } = await sb
      .from('rate_limit_events')
      .select('id', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', windowStart.toISOString());

    if (error) {
      throw error;
    }

    const requestCount = count ?? 0;
    const allowed = requestCount < maxRequests;

    if (allowed) {
      await sb.from('rate_limit_events').insert({ key });
    } else {
      await logSecurityIncident({
        incidentType: 'rate_limit_exceeded',
        severity: 'low',
        details: { key, requestCount, maxRequests, windowMinutes },
      });
    }

    const afterCount = allowed ? requestCount + 1 : requestCount;
    return {
      allowed,
      remaining: Math.max(0, maxRequests - afterCount),
      resetAt,
    };
  } catch {
    return { allowed: true, remaining: maxRequests, resetAt };
  }
}

export function clientIpFromVercelRequest(req: VercelRequest): string {
  const xf = req.headers['x-forwarded-for'];
  const forwarded = typeof xf === 'string' ? xf.split(',')[0]?.trim() : '';
  const realIp = req.headers['x-real-ip'];
  const ip = typeof realIp === 'string' ? realIp : forwarded;
  return ip || 'unknown';
}
