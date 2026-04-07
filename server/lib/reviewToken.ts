/**
 * Review token utilities.
 *
 * Generates HMAC tokens for the post-event review flow. Token inputs MUST match
 * the validation in server/api/submit-review.ts exactly.
 *
 * Confirmed inputs: `${bookingId}|${buyerId}` (pipe separator) — same as signToken() there.
 */

import { createHmac } from 'node:crypto';

export function generateReviewToken(bookingId: string, buyerId: string): string {
  const secret = process.env.REVIEW_SIGNING_SECRET?.trim();
  if (!secret) {
    throw new Error('REVIEW_SIGNING_SECRET is not set');
  }
  return createHmac('sha256', secret).update(`${bookingId}|${buyerId}`).digest('hex');
}

/**
 * Absolute review URL including providerId (required by ReviewPage and /api/submit-review).
 */
export function buildReviewUrl(
  bookingId: string,
  buyerId: string,
  providerId: string,
  baseUrl?: string,
): string {
  const token = generateReviewToken(bookingId, buyerId);
  const origin =
    (baseUrl ?? process.env.VITE_APP_ORIGIN)?.replace(/\/$/, '') || 'https://www.spicekrewe.com';
  const q = new URLSearchParams({
    bookingId,
    buyerId,
    providerId,
    token,
    bookingType: 'food_truck',
  });
  return `${origin}/review?${q.toString()}`;
}
