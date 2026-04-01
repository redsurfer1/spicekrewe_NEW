import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServiceRole } from '../lib/supabase.js';

type WindowConfig = {
  windowMs: number;
  maxRequests: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

export class RateLimiter {
  private buckets = new Map<string, Bucket>();

  private keyFor(ip: string, endpoint: string): string {
    return `${ip}:${endpoint}`;
  }

  private getClientIp(req: VercelRequest): string {
    const xf = req.headers['x-forwarded-for'];
    if (typeof xf === 'string' && xf.trim()) {
      return xf.split(',')[0]!.trim();
    }
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim()) {
      return realIp.trim();
    }
    const sock = (req as unknown as { socket?: { remoteAddress?: string } }).socket;
    return sock?.remoteAddress ?? 'unknown';
  }

  private cleanup(now: number): void {
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }

  private async logRateLimit(ip: string, endpoint: string): Promise<void> {
    try {
      const sb = getSupabaseServiceRole();
      await sb.from('audit_logs').insert({
        action: 'rate_limit_exceeded',
        entity_type: 'api',
        entity_id: endpoint,
        metadata: { ip, endpoint },
      });
    } catch {
      // Logging must never break the request path.
    }
  }

  /**
   * Checks and updates rate limits for a given request.
   * Returns true if the request has been rate limited and a 429 was sent.
   */
  async check(
    req: VercelRequest,
    res: VercelResponse,
    endpoint: string,
    config: WindowConfig,
  ): Promise<boolean> {
    const now = Date.now();
    this.cleanup(now);

    const ip = this.getClientIp(req);
    const key = this.keyFor(ip, endpoint);
    let bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + config.windowMs };
    }

    bucket.count += 1;
    this.buckets.set(key, bucket);

    if (bucket.count > config.maxRequests) {
      const retryAfter = Math.max(1, Math.round((bucket.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({ error: 'Too many requests', retryAfter });
      void this.logRateLimit(ip, endpoint);
      return true;
    }

    return false;
  }
}

export const rateLimiter = new RateLimiter();

