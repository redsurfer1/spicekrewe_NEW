/**
 * concierge-accept.ts
 *
 * SpiceKrewe concierge accept.
 * Core logic: Flomisma engine.
 * CLEAN MODEL: No Stripe PaymentIntent here.
 * Individual bookings are paid separately.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServiceRole } from '../lib/supabase.js';
import { logConciergeOutcome } from '../lib/conciergeOutcome.js';
import { escapeHtml, sendConciergeEmail } from '../lib/conciergeEmail.js';

type Body = {
  briefId?: string;
  packageId?: string;
  buyerId?: string;
};

type PackageJson = {
  packageItems?: Array<{
    providerId: string;
    providerName?: string;
    providerType?: string;
  }>;
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
        res.status(400).json({ error: 'Invalid JSON' });
        return;
      }
    }

    const b = body as Body;
    const briefId = typeof b.briefId === 'string' ? b.briefId.trim() : '';
    const packageId = typeof b.packageId === 'string' ? b.packageId.trim() : '';
    const buyerId = typeof b.buyerId === 'string' ? b.buyerId.trim() : '';

    if (!briefId || !buyerId) {
      res.status(400).json({ error: 'briefId and buyerId are required' });
      return;
    }

    const sb = getSupabaseServiceRole();

    const { data: briefRow, error: bErr } = await sb
      .from('concierge_briefs')
      .select('id, buyer_id, city_slug, status, ai_package_json')
      .eq('id', briefId)
      .maybeSingle();

    if (bErr) {
      // eslint-disable-next-line no-console
      console.error('[concierge-accept] brief', bErr);
      res.status(500).json({ error: 'Lookup failed' });
      return;
    }

    if (!briefRow) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }

    const brief = briefRow as {
      buyer_id: string;
      city_slug: string;
      status: string;
      ai_package_json: PackageJson | null;
    };

    if (brief.buyer_id !== buyerId) {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }

    if (brief.status !== 'ready') {
      res.status(400).json({ error: 'BRIEF_NOT_ACCEPTABLE' });
      return;
    }

    const pkgJson = (brief.ai_package_json ?? {}) as PackageJson;
    const items = pkgJson.packageItems ?? [];

    if (packageId) {
      await sb
        .from('concierge_packages')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', packageId)
        .eq('brief_id', briefId);
    }

    await sb
      .from('concierge_briefs')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', briefId);

    const providerTypes = items.map((it) =>
      it.providerType === 'food_truck' ? 'food_truck' : 'private_chef',
    );

    await logConciergeOutcome({
      stripeEventId: `native-accept:${briefId}:${packageId || 'pkg'}`,
      briefId,
      packageId: packageId || null,
      buyerId,
      citySlug: brief.city_slug,
      providerTypes,
      metadata: { source: 'concierge_accept' },
    });

    let buyerEmail: string | null = null;
    try {
      const { data: prof } = await sb.from('profiles').select('email').eq('id', buyerId).maybeSingle();
      const em = (prof as { email?: string } | null)?.email;
      buyerEmail = typeof em === 'string' && em.includes('@') ? em : null;
    } catch {
      /* ignore */
    }

    if (buyerEmail) {
      await sendConciergeEmail({
        to: buyerEmail,
        subject: 'Your SpiceKrewe event package is confirmed',
        html: `<p>Your concierge package for <strong>${escapeHtml(brief.city_slug)}</strong> is confirmed.</p><p>We will follow up with booking details for each provider.</p>`,
        dedup: {
          entityType: 'concierge_brief',
          entityId: briefId,
          type: 'buyer_confirmed',
          recipient: buyerEmail.toLowerCase(),
        },
      });
    }

    let notified = 0;
    for (const it of items) {
      const pid = it.providerId;
      if (!pid) continue;
      try {
        const { data: pRow } = await sb.from('profiles').select('email, display_name').eq('id', pid).maybeSingle();
        const pe = (pRow as { email?: string; display_name?: string } | null)?.email;
        const providerEmail = typeof pe === 'string' && pe.includes('@') ? pe : null;
        if (!providerEmail) continue;
        const ok = await sendConciergeEmail({
          to: providerEmail,
          subject: 'New SpiceKrewe concierge booking request',
          html: `<p>You have a new concierge-sourced request tied to brief <code>${escapeHtml(briefId)}</code>.</p>`,
          dedup: {
            entityType: 'concierge_brief',
            entityId: `${briefId}:${pid}`,
            type: 'provider_notified',
            recipient: providerEmail.toLowerCase(),
          },
        });
        if (ok) notified += 1;
      } catch {
        /* ignore */
      }
    }

    res.status(200).json({
      success: true,
      briefId,
      providersNotified: notified,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[concierge-accept]', e);
    res.status(500).json({ error: 'ACCEPT_FAILED' });
  }
}
