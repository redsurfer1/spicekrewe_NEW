/**
 * concierge-submit.ts
 *
 * SpiceKrewe concierge submit.
 * Core logic provided by Flomisma engine.
 * Native implementation — no external deps.
 *
 * CLEAN MODEL: Concierge is a free service.
 * Platform fee applies to resulting bookings.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServiceRole } from '../lib/supabase.js';
import {
  eventScaleFromGuestCount,
  generateConciergePackage,
  loadProvidersForCity,
} from '../lib/conciergeAgent.js';
import { sanitizeText } from '../lib/sanitize.js';
import { checkRateLimit, clientIpFromVercelRequest } from '../lib/rateLimiter.js';

type Body = {
  tenantId?: string;
  citySlug?: string;
  buyerId?: string;
  eventType?: string;
  guestCount?: number;
  theme?: string;
  budgetCents?: number;
  eventDate?: string;
  locationNotes?: string;
};

async function resolveCityDisplayName(citySlug: string): Promise<{ ok: boolean; displayName: string }> {
  try {
    const sb = getSupabaseServiceRole();
    const { data, error } = await sb
      .from('spicekrewe_cities')
      .select('slug, display_name, is_live')
      .eq('slug', citySlug)
      .maybeSingle();

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('[concierge-submit] spicekrewe_cities', error.message);
      return { ok: true, displayName: citySlug };
    }
    if (!data) {
      return { ok: false, displayName: citySlug };
    }
    const row = data as { is_live?: boolean; display_name?: string };
    if (row.is_live === false) {
      return { ok: false, displayName: citySlug };
    }
    return { ok: true, displayName: typeof row.display_name === 'string' ? row.display_name : citySlug };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[concierge-submit] city lookup failed', e);
    return { ok: true, displayName: citySlug };
  }
}

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
        res.status(400).json({ error: 'Invalid JSON' });
        return;
      }
    }

    const b = body as Body;
    const ip = clientIpFromVercelRequest(req);
    const rl = await checkRateLimit(`concierge_submit_${ip}`, 5, 60);
    if (!rl.allowed) {
      res.status(429).json({ error: 'Rate limit exceeded', resetAt: rl.resetAt.toISOString() });
      return;
    }

    const citySlug = typeof b.citySlug === 'string' ? b.citySlug.trim() : '';
    const buyerId = typeof b.buyerId === 'string' ? b.buyerId.trim() : '';
    const eventType = sanitizeText(typeof b.eventType === 'string' ? b.eventType.trim() : '', 100);
    const guestCount = typeof b.guestCount === 'number' ? b.guestCount : NaN;
    const budgetCents = typeof b.budgetCents === 'number' ? b.budgetCents : NaN;

    if (!citySlug || !buyerId || !eventType) {
      res.status(400).json({ error: 'citySlug, buyerId, and eventType are required' });
      return;
    }
    if (!Number.isFinite(guestCount) || guestCount < 1) {
      res.status(400).json({ error: 'guestCount invalid' });
      return;
    }
    if (!Number.isFinite(budgetCents) || budgetCents < 1) {
      res.status(400).json({ error: 'budgetCents invalid' });
      return;
    }

    const city = await resolveCityDisplayName(citySlug);
    if (!city.ok) {
      res.status(400).json({ error: 'City not available' });
      return;
    }

    const themeRaw = typeof b.theme === 'string' ? b.theme.trim() : '';
    const locationRaw = typeof b.locationNotes === 'string' ? b.locationNotes.trim() : '';
    const theme = themeRaw ? sanitizeText(themeRaw, 200) : null;
    const locationNotes = locationRaw ? sanitizeText(locationRaw, 500) : null;

    const eventScale = eventScaleFromGuestCount(guestCount);
    const { chefs, trucks } = await loadProvidersForCity(citySlug);

    const pkg = await generateConciergePackage({
      citySlug,
      cityDisplayName: city.displayName,
      eventType,
      guestCount,
      eventScale,
      theme,
      budgetCents,
      eventDate: b.eventDate ?? null,
      locationNotes,
      chefs,
      trucks,
    });

    const packagePayload = {
      eventScale: pkg.eventScale,
      packageItems: pkg.packageItems,
      estimatedTotalCents: pkg.estimatedTotalCents,
      packageNarrative: pkg.packageNarrative,
    };

    const nextStatus = pkg.requiresHumanReview ? 'pending_review' : 'ready';

    const sb = getSupabaseServiceRole();
    let briefId: string | null = null;
    let packageId: string | null = null;

    try {
      const { data: insertedBrief, error: brErr } = await sb
        .from('concierge_briefs')
        .insert({
          buyer_id: buyerId,
          city_slug: citySlug,
          event_type: eventType,
          guest_count: guestCount,
          theme,
          budget_cents: budgetCents,
          event_date: b.eventDate ? String(b.eventDate).slice(0, 10) : null,
          location_notes: locationNotes,
          event_scale: eventScale,
          status: nextStatus,
          requires_human_review: pkg.requiresHumanReview,
          ai_package_json: packagePayload as unknown as Record<string, unknown>,
          concierge_fee_cents: 0,
        })
        .select('id')
        .maybeSingle();

      if (brErr) {
        // eslint-disable-next-line no-console
        console.warn('[concierge-submit] concierge_briefs insert skipped', brErr.message);
      } else if (insertedBrief && typeof (insertedBrief as { id?: string }).id === 'string') {
        briefId = (insertedBrief as { id: string }).id;
      }

      if (briefId) {
        const { data: insertedPkg, error: pkgErr } = await sb
          .from('concierge_packages')
          .insert({
            brief_id: briefId,
            package_json: packagePayload as object,
            status: 'sent',
          })
          .select('id')
          .maybeSingle();

        if (pkgErr) {
          // eslint-disable-next-line no-console
          console.warn('[concierge-submit] concierge_packages insert skipped', pkgErr.message);
        } else if (insertedPkg && typeof (insertedPkg as { id?: string }).id === 'string') {
          packageId = (insertedPkg as { id: string }).id;
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[concierge-submit] persistence', e);
    }

    if (!briefId || !packageId) {
      res.status(503).json({
        error: 'CONCIERGE_STORAGE_UNAVAILABLE',
        message: 'Run docs/supabase-concierge.sql in Supabase, then retry.',
      });
      return;
    }

    res.status(200).json({
      briefId,
      status: nextStatus,
      package: { id: packageId, ...packagePayload },
      conciergeFee: 'Included',
      eventScale,
      message:
        nextStatus === 'pending_review'
          ? 'This brief is in review because estimated spend is high.'
          : 'Your concierge package is ready.',
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[concierge-submit]', e);
    res.status(500).json({ error: 'CONCIERGE_FAILED' });
  }
}
