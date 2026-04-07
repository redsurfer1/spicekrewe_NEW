/**
 * concierge-provider-response.ts
 *
 * SpiceKrewe concierge provider response.
 * Core logic: Flomisma engine.
 * CLEAN MODEL: Read/write only.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServiceRole } from '../lib/supabase.js';
import {
  eventScaleFromGuestCount,
  generateConciergePackage,
  loadProvidersForCity,
} from '../lib/conciergeAgent.js';
import { escapeHtml, sendConciergeEmail } from '../lib/conciergeEmail.js';

type Body = {
  briefId?: string;
  providerId?: string;
  action?: 'accept' | 'decline';
};

type AiPackage = {
  eventScale?: string;
  packageItems?: Array<Record<string, unknown>>;
  declinedProviders?: string[];
  providerResponses?: Record<string, string>;
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
    const providerId = typeof b.providerId === 'string' ? b.providerId.trim() : '';
    const action = b.action;

    if (!briefId || !providerId || (action !== 'accept' && action !== 'decline')) {
      res.status(400).json({ error: 'briefId, providerId, and action are required' });
      return;
    }

    const sb = getSupabaseServiceRole();

    const { data: briefRow, error: bErr } = await sb
      .from('concierge_briefs')
      .select(
        'id, buyer_id, city_slug, guest_count, event_type, theme, budget_cents, event_date, location_notes, ai_package_json',
      )
      .eq('id', briefId)
      .maybeSingle();

    if (bErr || !briefRow) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }

    const brief = briefRow as {
      buyer_id: string;
      city_slug: string;
      guest_count: number;
      event_type: string;
      theme: string | null;
      budget_cents: number;
      event_date: string | null;
      location_notes: string | null;
      ai_package_json: AiPackage | null;
    };

    const ai = (brief.ai_package_json ?? {}) as AiPackage;
    const responses = { ...(ai.providerResponses ?? {}) };
    responses[providerId] = action === 'accept' ? 'confirmed' : 'declined';

    if (action === 'accept') {
      const merged: AiPackage = { ...ai, providerResponses: responses };
      await sb
        .from('concierge_briefs')
        .update({ ai_package_json: merged as object, updated_at: new Date().toISOString() })
        .eq('id', briefId);

      let buyerEmail: string | null = null;
      try {
        const { data: prof } = await sb.from('profiles').select('email').eq('id', brief.buyer_id).maybeSingle();
        const em = (prof as { email?: string } | null)?.email;
        buyerEmail = typeof em === 'string' && em.includes('@') ? em : null;
      } catch {
        /* ignore */
      }
      if (buyerEmail) {
        await sendConciergeEmail({
          to: buyerEmail,
          subject: 'A provider confirmed your SpiceKrewe request',
          html: `<p>A provider has confirmed availability for your event (brief <code>${escapeHtml(briefId)}</code>).</p>`,
          dedup: {
            entityType: 'concierge_brief',
            entityId: `${briefId}:provider:${providerId}:accept`,
            type: 'buyer_provider_confirmed',
            recipient: buyerEmail.toLowerCase(),
          },
        });
      }

      res.status(200).json({ success: true, action, briefId });
      return;
    }

    const declined = [...(ai.declinedProviders ?? [])];
    if (!declined.includes(providerId)) declined.push(providerId);

    const { chefs: chefsRaw, trucks: trucksRaw } = await loadProvidersForCity(brief.city_slug);
    const chefs = chefsRaw.filter((c) => !declined.includes(c.id));
    const trucks = trucksRaw.filter((t) => !declined.includes(t.id));

    const guestCount = brief.guest_count;
    const eventScale = eventScaleFromGuestCount(guestCount);

    const pkg = await generateConciergePackage({
      citySlug: brief.city_slug,
      cityDisplayName: brief.city_slug,
      eventType: brief.event_type,
      guestCount,
      eventScale,
      theme: brief.theme,
      budgetCents: brief.budget_cents,
      eventDate: brief.event_date,
      locationNotes: brief.location_notes,
      chefs,
      trucks,
    });

    const nextPackage = {
      eventScale: pkg.eventScale,
      packageItems: pkg.packageItems,
      estimatedTotalCents: pkg.estimatedTotalCents,
      packageNarrative: pkg.packageNarrative,
      declinedProviders: declined,
      providerResponses: responses,
    };

    await sb
      .from('concierge_briefs')
      .update({
        ai_package_json: nextPackage as object,
        status: pkg.requiresHumanReview ? 'pending_review' : 'ready',
        requires_human_review: pkg.requiresHumanReview,
        updated_at: new Date().toISOString(),
      })
      .eq('id', briefId);

    await sb.from('concierge_packages').insert({
      brief_id: briefId,
      package_json: nextPackage as object,
      status: 'sent',
    });

    let buyerEmail: string | null = null;
    try {
      const { data: prof } = await sb.from('profiles').select('email').eq('id', brief.buyer_id).maybeSingle();
      const em = (prof as { email?: string } | null)?.email;
      buyerEmail = typeof em === 'string' && em.includes('@') ? em : null;
    } catch {
      /* ignore */
    }

    if (buyerEmail) {
      await sendConciergeEmail({
        to: buyerEmail,
        subject: 'Updated SpiceKrewe concierge package',
        html: `<p>We assembled an updated lineup after a provider declined.</p><p>${escapeHtml(pkg.packageNarrative)}</p>`,
        dedup: {
          entityType: 'concierge_brief',
          entityId: `${briefId}:refresh:${providerId}`,
          type: 'buyer_package_refresh',
          recipient: buyerEmail.toLowerCase(),
        },
      });
    }

    res.status(200).json({ success: true, action, briefId });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[concierge-provider-response]', e);
    res.status(500).json({ error: 'PROVIDER_RESPONSE_FAILED' });
  }
}
