/**
 * CLEAN MODEL: Review only. No financial data.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServiceRole } from '../lib/supabase.js';
import { sanitizeText } from '../lib/sanitize.js';
import { checkRateLimit, clientIpFromVercelRequest } from '../lib/rateLimiter.js';

function signToken(secret: string, bookingId: string, buyerId: string): string {
  return createHmac('sha256', secret).update(`${bookingId}|${buyerId}`).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

type Body = {
  bookingId?: string;
  buyerId?: string;
  providerId?: string;
  bookingType?: string;
  rating?: number;
  reviewText?: string;
  wouldBookAgain?: boolean;
  token?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const secret = process.env.REVIEW_SIGNING_SECRET?.trim();
    if (!secret) {
      res.status(503).json({ error: 'Reviews are not configured' });
      return;
    }

    const ip = clientIpFromVercelRequest(req);
    const rl = await checkRateLimit(`submit_review_${ip}`, 20, 60);
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
    const bookingId = sanitizeText(typeof b.bookingId === 'string' ? b.bookingId : '', 120);
    const buyerId = sanitizeText(typeof b.buyerId === 'string' ? b.buyerId : '', 120);
    const providerId = sanitizeText(typeof b.providerId === 'string' ? b.providerId : '', 120);
    const token = typeof b.token === 'string' ? b.token.trim() : '';
    const bookingTypeRaw = sanitizeText(typeof b.bookingType === 'string' ? b.bookingType : '', 32);
    const rating = typeof b.rating === 'number' && Number.isFinite(b.rating) ? Math.round(b.rating) : NaN;
    const reviewText = sanitizeText(typeof b.reviewText === 'string' ? b.reviewText : '', 4000);
    const wouldBookAgain = b.wouldBookAgain === true || b.wouldBookAgain === false ? b.wouldBookAgain : null;

    if (!bookingId || !buyerId || !providerId || !token) {
      res.status(400).json({ error: 'bookingId, buyerId, providerId, and token are required' });
      return;
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'rating must be between 1 and 5' });
      return;
    }

    const expected = signToken(secret, bookingId, buyerId);
    if (!safeEqual(expected, token)) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const bookingType =
      bookingTypeRaw === 'food_truck' || bookingTypeRaw === 'chef' || bookingTypeRaw === 'concierge'
        ? bookingTypeRaw === 'chef'
          ? 'chef'
          : bookingTypeRaw
        : 'food_truck';

    const combinedText =
      wouldBookAgain === null
        ? reviewText
        : `${reviewText ? `${reviewText}\n\n` : ''}[wouldBookAgain:${wouldBookAgain ? 'yes' : 'no'}]`;

    const supabase = getSupabaseServiceRole();
    const { error } = await supabase.from('booking_reviews').insert({
      booking_id: bookingId,
      booking_type: bookingType,
      buyer_id: buyerId,
      provider_id: providerId,
      rating,
      review_text: combinedText || null,
    });

    if (error) {
      if (error.code === '23505') {
        res.status(409).json({ error: 'Review already submitted' });
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    res.status(500).json({ error: msg });
  }
}
