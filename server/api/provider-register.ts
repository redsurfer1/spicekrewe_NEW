/**
 * CLEAN MODEL: Provider intake — no payment data. Rate-limited JSON accept for join flow.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sanitizeText } from '../lib/sanitize.js';
import { checkRateLimit, clientIpFromVercelRequest } from '../lib/rateLimiter.js';

type Body = {
  providerType?: string;
  displayName?: string;
  email?: string;
  city?: string;
  cuisines?: string[];
  bio?: string;
  rate?: number;
  truckName?: string;
  maxGuests?: number;
  powerRequired?: boolean;
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const ip = clientIpFromVercelRequest(req);
    const rl = await checkRateLimit(`provider_register_${ip}`, 5, 60);
    if (!rl.allowed) {
      res.status(429).json({ error: 'Rate limit exceeded', resetAt: rl.resetAt.toISOString() });
      return;
    }

    let body: unknown = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body) as unknown;
      } catch {
        res.status(400).json({ error: 'Invalid JSON' });
        return;
      }
    }

    const b = body as Body;
    const providerType = sanitizeText(typeof b.providerType === 'string' ? b.providerType : '', 32);
    const displayName = sanitizeText(typeof b.displayName === 'string' ? b.displayName : '', 120);
    const email = sanitizeText(typeof b.email === 'string' ? b.email : '', 320);
    const city = sanitizeText(typeof b.city === 'string' ? b.city : '', 80);
    const bio = sanitizeText(typeof b.bio === 'string' ? b.bio : '', 600);
    const truckName = sanitizeText(typeof b.truckName === 'string' ? b.truckName : '', 120);
    const cuisines = Array.isArray(b.cuisines)
      ? b.cuisines.map((c) => sanitizeText(String(c), 40)).filter(Boolean).slice(0, 12)
      : [];
    const rate = typeof b.rate === 'number' && Number.isFinite(b.rate) && b.rate > 0 ? b.rate : NaN;
    const maxGuests =
      typeof b.maxGuests === 'number' && Number.isFinite(b.maxGuests) && b.maxGuests > 0 ? Math.floor(b.maxGuests) : NaN;
    const powerRequired = b.powerRequired === true;

    if (providerType !== 'private_chef' && providerType !== 'food_truck') {
      res.status(400).json({ error: 'providerType must be private_chef or food_truck' });
      return;
    }
    if (!displayName || !email || !email.includes('@')) {
      res.status(400).json({ error: 'displayName and valid email are required' });
      return;
    }
    if (!city) {
      res.status(400).json({ error: 'city is required' });
      return;
    }
    if (bio.length < 50 || bio.length > 300) {
      res.status(400).json({ error: 'bio must be between 50 and 300 characters' });
      return;
    }
    if (!Number.isFinite(rate)) {
      res.status(400).json({ error: 'rate must be a positive number' });
      return;
    }
    if (cuisines.length === 0) {
      res.status(400).json({ error: 'Select at least one cuisine specialty' });
      return;
    }
    if (providerType === 'food_truck') {
      if (!truckName) {
        res.status(400).json({ error: 'truckName is required for food trucks' });
        return;
      }
      if (!Number.isFinite(maxGuests)) {
        res.status(400).json({ error: 'maxGuests is required for food trucks' });
        return;
      }
    }

    res.status(200).json({
      success: true,
      received: {
        providerType,
        displayName,
        email,
        city,
        cuisines,
        bio,
        rate,
        truckName: providerType === 'food_truck' ? truckName : undefined,
        maxGuests: providerType === 'food_truck' ? maxGuests : undefined,
        powerRequired: providerType === 'food_truck' ? powerRequired : undefined,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    res.status(500).json({ error: msg });
  }
}
