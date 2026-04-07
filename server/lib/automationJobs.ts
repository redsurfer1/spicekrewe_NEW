/**
 * SpiceKrewe automation jobs.
 *
 * Core pattern: Flomisma engine.
 * Customized for SpiceKrewe culinary vertical.
 *
 * Jobs query Supabase, dedupe via notification_log / sendConciergeEmail,
 * and may write operator_alerts + audit_log. They never throw.
 */

import { getSupabaseServiceRole } from './supabase.js';
import { wasEmailAlreadySent, recordEmailSent } from './emailDedup.js';
import { sendConciergeEmail, escapeHtml } from './conciergeEmail.js';
import { buildReviewUrl } from './reviewToken.js';

function sb() {
  return getSupabaseServiceRole();
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function appendAuditLog(event: {
  event_type: string;
  actor_id?: string | null;
  actor_type: string;
  entity_type?: string | null;
  entity_id?: string | null;
  payload?: Record<string, unknown>;
}): Promise<void> {
  try {
    await sb().from('audit_log').insert({
      event_type: event.event_type,
      actor_id: event.actor_id ?? 'system',
      actor_type: event.actor_type,
      entity_type: event.entity_type ?? null,
      entity_id: event.entity_id ?? null,
      payload: event.payload ?? {},
    });
  } catch {
    /* non-fatal */
  }
}

// ─────────────────────────────────────────
// SECTION 1: BOOKING LIFECYCLE
// ─────────────────────────────────────────

export async function sendEventReminders(): Promise<void> {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = ymd(tomorrow);

    const { data: bookings } = await sb()
      .from('food_truck_bookings')
      .select(
        'id, provider_id, buyer_id, event_date, event_address, buyer_email, provider_email, total_amount_cents, city_slug',
      )
      .eq('status', 'confirmed')
      .eq('event_date', tomorrowDate);

    for (const booking of bookings ?? []) {
      const id = String((booking as { id?: string }).id ?? '');
      const buyerEmail = String((booking as { buyer_email?: string }).buyer_email ?? '').trim();
      const providerEmail = String((booking as { provider_email?: string }).provider_email ?? '').trim();

      if (buyerEmail.includes('@')) {
        const dedup = { entityType: 'booking', entityId: id, type: 'reminder_buyer', recipient: buyerEmail };
        if (!(await wasEmailAlreadySent(dedup))) {
          await sendConciergeEmail({
            to: buyerEmail,
            subject: 'Reminder: your SpiceKrewe event is tomorrow',
            html: `<p>Your booking <strong>${escapeHtml(id)}</strong> is scheduled for <strong>${escapeHtml(String((booking as { event_date?: string }).event_date ?? ''))}</strong>.</p>`,
            dedup,
          });
        }
      }

      if (providerEmail.includes('@')) {
        const dedup = { entityType: 'booking', entityId: id, type: 'reminder_provider', recipient: providerEmail };
        if (!(await wasEmailAlreadySent(dedup))) {
          await sendConciergeEmail({
            to: providerEmail,
            subject: 'Reminder: SpiceKrewe booking tomorrow',
            html: `<p>You have a confirmed booking <strong>${escapeHtml(id)}</strong> tomorrow.</p>`,
            dedup,
          });
        }
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[sendEventReminders]', err);
  }
}

export async function sendProviderFinalNudge(): Promise<void> {
  try {
    const today = ymd(new Date());
    const { data: bookings } = await sb()
      .from('food_truck_bookings')
      .select('id, provider_id, provider_email, event_date, event_address, buyer_id, total_amount_cents')
      .eq('status', 'confirmed')
      .eq('event_date', today);

    for (const booking of bookings ?? []) {
      const id = String((booking as { id?: string }).id ?? '');
      const providerEmail = String((booking as { provider_email?: string }).provider_email ?? '').trim();
      if (!providerEmail.includes('@')) continue;
      const dedup = { entityType: 'booking', entityId: id, type: 'final_nudge_provider', recipient: providerEmail };
      if (await wasEmailAlreadySent(dedup)) continue;
      await sendConciergeEmail({
        to: providerEmail,
        subject: 'Today is your SpiceKrewe event — quick recap',
        html: `<p>Booking <strong>${escapeHtml(id)}</strong> is today. Thank you for serving on SpiceKrewe.</p>`,
        dedup,
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[sendProviderFinalNudge]', err);
  }
}

export async function sendPostEventReviewRequests(): Promise<void> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = ymd(yesterday);

    const { data: bookings } = await sb()
      .from('food_truck_bookings')
      .select('id, provider_id, buyer_id, buyer_email, event_date, review_requested_at, city_slug')
      .eq('status', 'confirmed')
      .eq('event_date', yesterdayDate)
      .is('review_requested_at', null);

    for (const booking of bookings ?? []) {
      const id = String((booking as { id?: string }).id ?? '');
      const buyerId = String((booking as { buyer_id?: string }).buyer_id ?? '').trim();
      const providerId = String((booking as { provider_id?: string }).provider_id ?? '').trim();
      const buyerEmail = String((booking as { buyer_email?: string }).buyer_email ?? '').trim();
      if (!buyerEmail.includes('@')) continue;
      const dedup = { entityType: 'booking', entityId: id, type: 'review_request', recipient: buyerEmail };
      if (await wasEmailAlreadySent(dedup)) continue;

      await sb()
        .from('food_truck_bookings')
        .update({ review_requested_at: new Date().toISOString() })
        .eq('id', id);

      let reviewUrl: string | null = null;
      try {
        if (buyerId && providerId) {
          reviewUrl = buildReviewUrl(id, buyerId, providerId);
        }
      } catch {
        // eslint-disable-next-line no-console
        console.warn(
          '[sendPostEventReviewRequests] REVIEW_SIGNING_SECRET not set — review link omitted from email',
        );
      }

      const bodyHtml =
        `<p>We hope your event was a success! Your review helps other Memphis buyers find great chefs and food trucks.</p>` +
        (reviewUrl
          ? `<p><a href="${escapeHtml(reviewUrl)}">Leave a review →</a></p>` +
            `<p style="font-size:12px;color:#666;">This link is unique to your booking and expires after submission.</p>`
          : '') +
        `<p>Your feedback helps buyers choose great providers. Booking <strong>${escapeHtml(id)}</strong>.</p>`;

      await sendConciergeEmail({
        to: buyerEmail,
        subject: 'How did your SpiceKrewe event go?',
        html: bodyHtml,
        dedup,
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[sendPostEventReviewRequests]', err);
  }
}

export async function detectNoShows(): Promise<void> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = ymd(yesterday);

    const { data: bookings } = await sb()
      .from('food_truck_bookings')
      .select('id, provider_id, buyer_id, buyer_email, event_date, no_show_flagged')
      .eq('status', 'confirmed')
      .eq('event_date', yesterdayDate)
      .is('completed_at', null)
      .or('no_show_flagged.is.null,no_show_flagged.eq.false');

    for (const booking of bookings ?? []) {
      const id = String((booking as { id?: string }).id ?? '');
      await sb().from('food_truck_bookings').update({ no_show_flagged: true }).eq('id', id);

      await sb().from('operator_alerts').insert({
        alert_type: 'no_show',
        entity_type: 'booking',
        entity_id: id,
        message: `Potential no-show: booking ${id} on ${String((booking as { event_date?: string }).event_date ?? '')} has no completion record.`,
      });

      const buyerEmail = String((booking as { buyer_email?: string }).buyer_email ?? '').trim();
      if (buyerEmail.includes('@')) {
        const dedup = { entityType: 'booking', entityId: id, type: 'no_show_checkin', recipient: buyerEmail };
        if (!(await wasEmailAlreadySent(dedup))) {
          await sendConciergeEmail({
            to: buyerEmail,
            subject: 'Quick check-in about your recent booking',
            html: `<p>We noticed your booking date passed. If anything went wrong, reply and our team can help.</p>`,
            dedup,
          });
        }
      }

      await appendAuditLog({
        event_type: 'no_show_flagged',
        actor_id: 'system',
        actor_type: 'cron',
        entity_type: 'booking',
        entity_id: id,
        payload: {
          event_date: (booking as { event_date?: string }).event_date,
          provider_id: (booking as { provider_id?: string }).provider_id,
        },
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[detectNoShows]', err);
  }
}

// ─────────────────────────────────────────
// SECTION 2: CONCIERGE LIFECYCLE
// ─────────────────────────────────────────

export async function autoDeclineUnresponsiveProviders(): Promise<void> {
  const windowHours = Number.parseInt(process.env.PROVIDER_DECLINE_WINDOW_HOURS ?? '24', 10);
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - (Number.isFinite(windowHours) ? windowHours : 24));

  try {
    const { data: briefs } = await sb()
      .from('concierge_briefs')
      .select('id, ai_package_json, city_slug, buyer_email, status, updated_at')
      .in('status', ['ready', 'pending_provider_response'])
      .lt('updated_at', cutoff.toISOString());

    for (const brief of briefs ?? []) {
      const id = String((brief as { id?: string }).id ?? '');
      const pkg = (brief as { ai_package_json?: unknown }).ai_package_json as
        | { packageItems?: Array<Record<string, unknown>> }
        | null
        | undefined;
      if (!pkg?.packageItems?.length) continue;

      let changed = false;
      for (const item of pkg.packageItems) {
        const accepted = Boolean(item.providerAccepted);
        const declined = Boolean(item.providerDeclined);
        if (accepted || declined) continue;
        item.providerDeclined = true;
        item.declinedReason = 'no_response';
        item.declinedAt = new Date().toISOString();
        changed = true;
        await appendAuditLog({
          event_type: 'provider_auto_declined',
          actor_id: 'system',
          actor_type: 'cron',
          entity_type: 'concierge_brief',
          entity_id: id,
          payload: { provider_id: item.providerId, reason: 'no_response_in_window' },
        });
      }

      if (changed) {
        await sb().from('concierge_briefs').update({ ai_package_json: pkg as object }).eq('id', id);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[autoDeclineUnresponsiveProviders]', err);
  }
}

export async function recoverAbandonedConciergeBriefs(): Promise<void> {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 6);

  try {
    const { data: briefs } = await sb()
      .from('concierge_briefs')
      .select(
        'id, buyer_id, buyer_email, event_type, guest_count, budget_cents, ai_package_json, recovery_email_sent_at, city_slug',
      )
      .eq('status', 'ready')
      .lt('created_at', cutoff.toISOString())
      .is('recovery_email_sent_at', null);

    for (const brief of briefs ?? []) {
      const id = String((brief as { id?: string }).id ?? '');
      const buyerEmail = String((brief as { buyer_email?: string }).buyer_email ?? '').trim();
      if (!buyerEmail.includes('@')) continue;
      const dedup = { entityType: 'concierge_brief', entityId: id, type: 'abandoned_recovery', recipient: buyerEmail };
      if (await wasEmailAlreadySent(dedup)) continue;

      await sb().from('concierge_briefs').update({ recovery_email_sent_at: new Date().toISOString() }).eq('id', id);

      await sendConciergeEmail({
        to: buyerEmail,
        subject: 'Your SpiceKrewe concierge package is still available',
        html: `<p>We put together options for your event. Open SpiceKrewe to review and accept when you are ready.</p>`,
        dedup,
        metadata: { event_type: (brief as { event_type?: string }).event_type },
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[recoverAbandonedConciergeBriefs]', err);
  }
}

export async function alertHumanReviewBacklog(): Promise<void> {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 4);
  const opsEmail = process.env.CONCIERGE_OPS_EMAIL?.trim() ?? '';
  if (!opsEmail.includes('@')) return;

  try {
    const { data: briefs } = await sb()
      .from('concierge_briefs')
      .select('id, event_type, guest_count, budget_cents, created_at, city_slug')
      .eq('status', 'pending_review')
      .lt('created_at', cutoff.toISOString());

    if (!briefs?.length) return;

    const dedup = { entityType: 'system', entityId: 'human_review_backlog', type: 'backlog_alert', recipient: opsEmail };
    if (await wasEmailAlreadySent(dedup)) return;

    const lines = briefs
      .map((b) => {
        const budget = (b as { budget_cents?: number }).budget_cents ?? 0;
        return `<li>${escapeHtml(String((b as { id?: string }).id ?? ''))} — ${escapeHtml(String((b as { event_type?: string }).event_type ?? ''))} — $${(budget / 100).toFixed(0)}</li>`;
      })
      .join('');

    await sendConciergeEmail({
      to: opsEmail,
      subject: `SpiceKrewe: ${briefs.length} concierge brief(s) need human review`,
      html: `<p>High-value / review-required backlog:</p><ul>${lines}</ul>`,
      dedup,
      metadata: { count: briefs.length },
    });

    for (const brief of briefs) {
      const bid = String((brief as { id?: string }).id ?? '');
      const budget = (brief as { budget_cents?: number }).budget_cents ?? 0;
      await sb().from('operator_alerts').insert({
        alert_type: 'human_review_backlog',
        entity_type: 'concierge_brief',
        entity_id: bid,
        message: `Brief ${bid} waiting >4h for human review. Budget: $${(budget / 100).toFixed(0)}`,
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[alertHumanReviewBacklog]', err);
  }
}

// ─────────────────────────────────────────
// SECTION 3: PROVIDER RELATIONSHIP
// ─────────────────────────────────────────

export async function calculateProfileCompleteness(): Promise<void> {
  try {
    const { data: providers } = await sb()
      .from('profiles')
      .select(
        'id, display_name, bio, cuisine_categories, rate_per_hour, is_verified, obi_score, provider_type, truck_name, max_capacity, health_permit_verified',
      )
      .eq('is_active', true);

    for (const p of providers ?? []) {
      let score = 0;
      if ((p as { display_name?: string }).display_name) score += 10;
      const bio = String((p as { bio?: string }).bio ?? '');
      if (bio.length > 50) score += 15;
      const cats = (p as { cuisine_categories?: unknown }).cuisine_categories;
      if (Array.isArray(cats) && cats.length > 0) score += 15;
      if ((p as { rate_per_hour?: number | null }).rate_per_hour) score += 10;
      if ((p as { is_verified?: boolean }).is_verified) score += 10;

      const ptype = String((p as { provider_type?: string }).provider_type ?? 'private_chef');
      if (ptype === 'food_truck') {
        if ((p as { truck_name?: string }).truck_name) score += 10;
        if ((p as { max_capacity?: number | null }).max_capacity) score += 15;
        if ((p as { health_permit_verified?: boolean }).health_permit_verified) score += 15;
      } else {
        const obi = Number((p as { obi_score?: number | null }).obi_score ?? 0);
        if (obi > 0) score += 20;
        if ((p as { is_verified?: boolean }).is_verified) score += 10;
      }

      score = Math.min(100, score);
      const pid = String((p as { id?: string }).id ?? '');
      await sb().from('profiles').update({ profile_completeness: score }).eq('id', pid);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[calculateProfileCompleteness]', err);
  }
}

export async function sendProfileCompletenessNudges(): Promise<void> {
  try {
    const { data: providers } = await sb()
      .from('profiles')
      .select(
        'id, display_name, bio, cuisine_categories, rate_per_hour, provider_type, truck_name, max_capacity, profile_completeness, health_permit_verified',
      )
      .eq('is_active', true)
      .lt('profile_completeness', 80);

    for (const p of providers ?? []) {
      let suggestion = '';
      const bio = String((p as { bio?: string }).bio ?? '');
      if (bio.length < 50) suggestion = 'Add a detailed bio (at least 50 characters)';
      else if (!(p as { rate_per_hour?: number | null }).rate_per_hour) suggestion = 'Set your hourly rate so buyers know what to expect';
      else if (
        !Array.isArray((p as { cuisine_categories?: unknown }).cuisine_categories) ||
        ((p as { cuisine_categories?: string[] }).cuisine_categories?.length ?? 0) === 0
      )
        suggestion = 'Add your cuisine specialties';
      else if (String((p as { provider_type?: string }).provider_type) === 'food_truck' && !(p as { max_capacity?: number | null }).max_capacity)
        suggestion = 'Add your maximum guest capacity';
      else suggestion = 'Complete verification to rank higher in search';

      // eslint-disable-next-line no-console
      console.log(`[profileNudge] provider ${String((p as { id?: string }).id)} score ${String((p as { profile_completeness?: number }).profile_completeness)}: ${suggestion}`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[sendProfileCompletenessNudges]', err);
  }
}

export async function detectInactiveProviders(): Promise<void> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const iso = thirtyDaysAgo.toISOString();

  try {
    const { data: providers } = await sb()
      .from('profiles')
      .select('id, display_name, last_booking_at, profile_completeness, provider_type, inactivity_email_sent_at')
      .eq('is_active', true)
      .or(`last_booking_at.is.null,last_booking_at.lt.${iso}`);

    for (const p of providers ?? []) {
      const sentAt = (p as { inactivity_email_sent_at?: string | null }).inactivity_email_sent_at;
      if (sentAt) {
        const lastSent = new Date(sentAt);
        if (lastSent > thirtyDaysAgo) continue;
      }
      const pid = String((p as { id?: string }).id ?? '');
      await sb().from('profiles').update({ inactivity_email_sent_at: new Date().toISOString() }).eq('id', pid);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[detectInactiveProviders]', err);
  }
}

export async function sendVerificationReminders(): Promise<void> {
  try {
    const now = new Date();
    const { data: providers } = await sb()
      .from('profiles')
      .select('id, display_name, created_at, is_founding_provider, verification_reminder_count, provider_type, is_verified')
      .eq('is_active', true)
      .eq('is_verified', false);

    for (const p of providers ?? []) {
      const created = new Date(String((p as { created_at?: string }).created_at ?? now.toISOString()));
      const daysSince = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      const count = Number((p as { verification_reminder_count?: number }).verification_reminder_count ?? 0);
      const pid = String((p as { id?: string }).id ?? '');

      if (daysSince >= 3 && count === 0) {
        await sb().from('profiles').update({ verification_reminder_count: 1 }).eq('id', pid);
      } else if (daysSince >= 7 && count === 1) {
        await sb().from('profiles').update({ verification_reminder_count: 2 }).eq('id', pid);
      } else if (daysSince >= 14 && count === 2) {
        await sb().from('profiles').update({ verification_reminder_count: 3 }).eq('id', pid);
        if ((p as { is_founding_provider?: boolean }).is_founding_provider) {
          await sb().from('operator_alerts').insert({
            alert_type: 'founding_provider_unverified',
            entity_type: 'profile',
            entity_id: pid,
            message: `Founding provider ${String((p as { display_name?: string }).display_name)} still unverified after ${daysSince} days.`,
          });
        }
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[sendVerificationReminders]', err);
  }
}

export async function checkPermitExpiration(): Promise<void> {
  try {
    const now = new Date();
    const { data: trucks } = await sb()
      .from('profiles')
      .select('id, display_name, permit_expiry_date, is_verified, provider_type')
      .eq('provider_type', 'food_truck')
      .eq('is_active', true)
      .not('permit_expiry_date', 'is', null);

    for (const truck of trucks ?? []) {
      const expiry = new Date(String((truck as { permit_expiry_date?: string }).permit_expiry_date));
      const daysUntil = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const tid = String((truck as { id?: string }).id ?? '');

      if (daysUntil < 0 && (truck as { is_verified?: boolean }).is_verified) {
        await sb().from('profiles').update({ is_verified: false }).eq('id', tid);
        await sb().from('operator_alerts').insert({
          alert_type: 'permit_expiry',
          entity_type: 'profile',
          entity_id: tid,
          message: `${String((truck as { display_name?: string }).display_name)} permit expired. Verified badge suspended.`,
        });
        await appendAuditLog({
          event_type: 'verified_badge_suspended',
          actor_id: 'system',
          actor_type: 'cron',
          entity_type: 'profile',
          entity_id: tid,
          payload: { reason: 'permit_expired', expiry_date: (truck as { permit_expiry_date?: string }).permit_expiry_date },
        });
      } else if (daysUntil === 60 || daysUntil === 30 || daysUntil === 7) {
        // eslint-disable-next-line no-console
        console.log(`[permitReminder] ${String((truck as { display_name?: string }).display_name)}: ${daysUntil} days`);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[checkPermitExpiration]', err);
  }
}

// ─────────────────────────────────────────
// SECTION 4: OPERATOR REPORTING
// ─────────────────────────────────────────

export async function sendDailyOperatorDigest(): Promise<void> {
  const opsEmail = process.env.CONCIERGE_OPS_EMAIL?.trim() ?? '';
  if (!opsEmail.includes('@')) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 1);

  try {
    const iso = cutoff.toISOString();

    const [newProviders, completedBookings, newBriefs, pendingReview, unresolved, revenueRows] = await Promise.all([
      sb().from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', iso),
      sb().from('food_truck_bookings').select('id', { count: 'exact', head: true }).gte('completed_at', iso),
      sb().from('concierge_briefs').select('id', { count: 'exact', head: true }).gte('created_at', iso),
      sb().from('concierge_briefs').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      sb().from('operator_alerts').select('id', { count: 'exact', head: true }).eq('resolved', false),
      sb().from('food_truck_bookings').select('platform_fee_cents').gte('created_at', iso),
    ]);

    const totalRevenueCents = (revenueRows.data ?? []).reduce((sum, b) => sum + (Number((b as { platform_fee_cents?: number }).platform_fee_cents) || 0), 0);

    const digest = {
      newProviders: newProviders.count ?? 0,
      completedBookings: completedBookings.count ?? 0,
      newBriefs: newBriefs.count ?? 0,
      pendingReview: pendingReview.count ?? 0,
      unresolvedAlerts: unresolved.count ?? 0,
      revenueDollars: (totalRevenueCents / 100).toFixed(2),
    };

    const dedup = { entityType: 'system', entityId: 'daily_digest', type: 'operator_digest', recipient: opsEmail };
    if (await wasEmailAlreadySent(dedup)) return;

    await sendConciergeEmail({
      to: opsEmail,
      subject: `SpiceKrewe daily digest — $${digest.revenueDollars} fees (new bookings last 24h)`,
      html: `<pre>${escapeHtml(JSON.stringify(digest, null, 2))}</pre>`,
      dedup,
      metadata: digest,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[sendDailyOperatorDigest]', err);
  }
}

export async function checkRevenueAnomaly(): Promise<void> {
  const opsEmail = process.env.CONCIERGE_OPS_EMAIL?.trim() ?? '';
  if (!opsEmail.includes('@')) return;
  const threshold = Number.parseFloat(process.env.REVENUE_DROP_ALERT_THRESHOLD ?? '0.20');

  try {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    const [thisWeek, lastWeek] = await Promise.all([
      sb().from('food_truck_bookings').select('platform_fee_cents').gte('created_at', oneWeekAgo.toISOString()),
      sb()
        .from('food_truck_bookings')
        .select('platform_fee_cents')
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', oneWeekAgo.toISOString()),
    ]);

    const sum = (rows: unknown) =>
      (Array.isArray(rows) ? rows : []).reduce((s: number, b: { platform_fee_cents?: number }) => s + (Number(b.platform_fee_cents) || 0), 0);

    const thisTotal = sum(thisWeek.data ?? []);
    const lastTotal = sum(lastWeek.data ?? []);

    if (lastTotal > 0) {
      const change = (thisTotal - lastTotal) / lastTotal;
      if (change < -threshold) {
        await sb().from('operator_alerts').insert({
          alert_type: 'revenue_drop',
          entity_type: 'system',
          entity_id: 'weekly_revenue',
          message: `Revenue dropped ${Math.abs(change * 100).toFixed(0)}% week over week.`,
        });
        await recordEmailSent(
          { entityType: 'system', entityId: 'revenue_drop', type: 'operator_alert', recipient: opsEmail },
          { thisTotal, lastTotal },
        );
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[checkRevenueAnomaly]', err);
  }
}

export async function sendCityPipelineReport(): Promise<void> {
  const opsEmail = process.env.CONCIERGE_OPS_EMAIL?.trim() ?? '';
  if (!opsEmail.includes('@')) return;

  try {
    const { data: cities } = await sb().from('spicekrewe_cities').select('slug, display_name, state_code, is_live');
    const cityReports: unknown[] = [];

    for (const city of cities ?? []) {
      const slug = String((city as { slug?: string }).slug ?? '');
      const [chefs, trucks, waitlist] = await Promise.all([
        sb().from('profiles').select('id', { count: 'exact', head: true }).eq('city_slug', slug).eq('provider_type', 'private_chef').eq('is_active', true),
        sb().from('profiles').select('id', { count: 'exact', head: true }).eq('city_slug', slug).eq('provider_type', 'food_truck').eq('is_active', true),
        sb().from('notification_log').select('id', { count: 'exact', head: true }).eq('entity_type', 'city').eq('entity_id', slug).eq('type', 'waitlist'),
      ]);

      const chefCount = chefs.count ?? 0;
      const truckCount = trucks.count ?? 0;
      cityReports.push({
        city: `${String((city as { display_name?: string }).display_name)}, ${String((city as { state_code?: string }).state_code)}`,
        isLive: Boolean((city as { is_live?: boolean }).is_live),
        chefCount,
        truckCount,
        waitlistCount: waitlist.count ?? 0,
        ready: chefCount >= 10 && truckCount >= 5,
      });
    }

    const dedup = { entityType: 'system', entityId: 'city_pipeline', type: 'weekly_report', recipient: opsEmail };
    if (await wasEmailAlreadySent(dedup)) return;

    await sendConciergeEmail({
      to: opsEmail,
      subject: 'SpiceKrewe weekly city pipeline',
      html: `<pre>${escapeHtml(JSON.stringify(cityReports, null, 2))}</pre>`,
      dedup,
      metadata: { cities: cityReports },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[sendCityPipelineReport]', err);
  }
}

export async function detectBookingConflicts(): Promise<void> {
  try {
    const start = ymd(new Date());
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const end = ymd(endDate);

    const { data: bookings } = await sb()
      .from('food_truck_bookings')
      .select('id, provider_id, event_date, status')
      .in('status', ['confirmed', 'pending'])
      .gte('event_date', start)
      .lte('event_date', end);

    const groups = new Map<string, Array<{ id?: string; provider_id?: string; event_date?: string }>>();
    for (const b of bookings ?? []) {
      const row = b as { id?: string; provider_id?: string; event_date?: string };
      const key = `${row.provider_id}_${row.event_date}`;
      const g = groups.get(key) ?? [];
      g.push(row);
      groups.set(key, g);
    }

    for (const [, group] of groups.entries()) {
      if (group.length > 1) {
        const first = group[0];
        await sb().from('operator_alerts').insert({
          alert_type: 'capacity_conflict',
          entity_type: 'booking',
          entity_id: String(first.id ?? ''),
          message: `Capacity conflict: provider ${String(first.provider_id)} has ${group.length} bookings on ${String(first.event_date)}.`,
        });
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[detectBookingConflicts]', err);
  }
}

// ─────────────────────────────────────────
// SECTION 5: COMPLIANCE + SECURITY
// ─────────────────────────────────────────

export async function enforceDataRetention(): Promise<void> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  try {
    const { data: staleAudit } = await sb().from('audit_log').select('id').lt('created_at', oneYearAgo.toISOString()).limit(5000);

    let auditUpdated = 0;
    for (const row of staleAudit ?? []) {
      const id = String((row as { id?: string }).id ?? '');
      const { error } = await sb()
        .from('audit_log')
        .update({ ip_address: null, user_agent: null, payload: {} })
        .eq('id', id);
      if (!error) auditUpdated += 1;
    }

    const { data: resolvedAlerts } = await sb()
      .from('operator_alerts')
      .select('id')
      .eq('resolved', true)
      .lt('resolved_at', ninetyDaysAgo.toISOString())
      .limit(2000);

    let alertsDeleted = 0;
    for (const row of resolvedAlerts ?? []) {
      const id = String((row as { id?: string }).id ?? '');
      const { error } = await sb().from('operator_alerts').delete().eq('id', id);
      if (!error) alertsDeleted += 1;
    }

    await sb().from('data_retention_log').insert([
      { table_name: 'audit_log', records_deleted: auditUpdated, retention_policy: '1_year_anonymize_pii' },
      { table_name: 'operator_alerts', records_deleted: alertsDeleted, retention_policy: '90_days_resolved_alerts' },
    ]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[enforceDataRetention]', err);
  }
}
