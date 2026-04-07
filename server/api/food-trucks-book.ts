/**
 * CLEAN MODEL: Payment via Stripe. Platform does not hold funds.
 * See: docs/dual-entity-operating-boundary.md
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getSupabaseServiceRole } from '../lib/supabase.js';
import { sanitizeText } from '../lib/sanitize.js';
import { checkRateLimit, clientIpFromVercelRequest } from '../lib/rateLimiter.js';

type BookBody = {
  providerId?: string;
  buyerId?: string;
  date?: string;
  duration?: number;
  headcount?: number;
  eventDescription?: string;
  locationAddress?: string;
  citySlug?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
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

    const b = body as BookBody;
    const buyerId = typeof b.buyerId === 'string' ? b.buyerId.trim() : '';
    const ip = clientIpFromVercelRequest(req);
    const rlKey = buyerId ? `food_trucks_book_${buyerId}` : `food_trucks_book_${ip}`;
    const rl = await checkRateLimit(rlKey, 10, 60);
    if (!rl.allowed) {
      res.status(429).json({ error: 'Rate limit exceeded', resetAt: rl.resetAt.toISOString() });
      return;
    }

    const providerId = typeof b.providerId === 'string' ? b.providerId.trim() : '';
    const date = typeof b.date === 'string' ? b.date.trim() : '';
    const duration = typeof b.duration === 'number' && Number.isFinite(b.duration) ? b.duration : NaN;
    const headcount = typeof b.headcount === 'number' && Number.isFinite(b.headcount) ? b.headcount : NaN;
    const eventDescription = sanitizeText(typeof b.eventDescription === 'string' ? b.eventDescription : '', 500);
    const locationAddress = sanitizeText(typeof b.locationAddress === 'string' ? b.locationAddress : '', 500);
    const citySlug = typeof b.citySlug === 'string' ? b.citySlug.trim() : '';

    if (!providerId || !buyerId || !date || !citySlug) {
      res.status(400).json({ error: 'providerId, buyerId, date, and citySlug are required' });
      return;
    }
    if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(headcount) || headcount < 1) {
      res.status(400).json({ error: 'duration and headcount must be positive numbers' });
      return;
    }
    if (!eventDescription.trim() || !locationAddress.trim()) {
      res.status(400).json({ error: 'eventDescription and locationAddress are required' });
      return;
    }

    const supabase = getSupabaseServiceRole();

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('id, provider_type, rate_per_hour, max_capacity')
      .eq('id', providerId)
      .maybeSingle();

    if (pErr) {
      // eslint-disable-next-line no-console
      console.error('[food-trucks-book] profile', pErr);
      res.status(500).json({ error: 'Provider lookup failed' });
      return;
    }

    if (!profile || (profile as { provider_type?: string }).provider_type !== 'food_truck') {
      res.status(404).json({ error: 'Food truck provider not found' });
      return;
    }

    const ratePerHour = (profile as { rate_per_hour?: number | null }).rate_per_hour;
    if (typeof ratePerHour !== 'number' || ratePerHour <= 0) {
      res.status(400).json({ error: 'Provider rate not configured' });
      return;
    }

    const maxCap = (profile as { max_capacity?: number | null }).max_capacity;
    if (typeof maxCap === 'number' && maxCap > 0 && headcount > maxCap) {
      res.status(409).json({ error: 'Headcount exceeds provider capacity' });
      return;
    }

    const { count: conflictCount, error: availErr } = await supabase
      .from('food_truck_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('event_date', date)
      .in('status', ['pending', 'confirmed']);

    if (availErr) {
      const msg = availErr.message?.toLowerCase() ?? '';
      if (!(msg.includes('relation') && msg.includes('does not exist'))) {
        // eslint-disable-next-line no-console
        console.error('[food-trucks-book] availability', availErr);
        res.status(500).json({ error: 'Availability check failed' });
        return;
      }
    } else if ((conflictCount ?? 0) > 0) {
      res.status(409).json({ error: 'Provider is not available on this date' });
      return;
    }

    const amountCents = Math.round(ratePerHour * duration);
    if (amountCents < 50) {
      res.status(400).json({ error: 'Amount too small for Stripe' });
      return;
    }

    const platformFeeCents = Math.round(amountCents * 0.05);

    const secret = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secret) {
      res.status(503).json({ error: 'Stripe is not configured' });
      return;
    }

    const stripe = new Stripe(secret);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: {
        flow: 'food_truck_booking',
        providerId,
        buyerId,
        date,
        citySlug,
        providerType: 'food_truck',
        platformFeeCents: String(platformFeeCents),
      },
    });

    let bookingId: string | null = null;
    try {
      const { data: inserted, error: insErr } = await supabase
        .from('food_truck_bookings')
        .insert({
          provider_id: providerId,
          buyer_id: buyerId,
          city_slug: citySlug,
          event_date: date,
          duration_hours: Math.round(duration),
          headcount: Math.round(headcount),
          event_description: eventDescription,
          location_address: locationAddress,
          status: 'pending',
          stripe_payment_intent_id: paymentIntent.id,
          platform_fee_cents: platformFeeCents,
          total_amount_cents: amountCents,
        })
        .select('id')
        .maybeSingle();

      if (insErr) {
        // eslint-disable-next-line no-console
        console.warn('[food-trucks-book] booking insert skipped', insErr.message);
      } else if (inserted && typeof (inserted as { id?: string }).id === 'string') {
        bookingId = (inserted as { id: string }).id;
      }
    } catch (ins) {
      // eslint-disable-next-line no-console
      console.warn('[food-trucks-book] booking insert failed', ins);
    }

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      bookingId,
      amount: amountCents,
      platformFee: platformFeeCents,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[food-trucks-book]', e);
    res.status(500).json({ error: 'Booking failed' });
  }
}
