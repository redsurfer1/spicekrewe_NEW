import { Resend } from 'resend';
import { ensureBookingForBrief } from '../lib/bookings.js';
import { getBriefRecord, patchBriefRecord } from '../lib/supabase-brief.js';
import { getSupabaseServiceRole } from '../lib/supabase.js';
import { recordEmailSent, wasEmailAlreadySent } from '../lib/emailDedup.js';

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

function fromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || 'hello@spicekrewe.com';
}

function appOrigin(): string {
  return process.env.VITE_APP_ORIGIN?.trim() || process.env.APP_ORIGIN?.trim() || 'https://spicekrewe.com';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractClientEmail(fields: Record<string, unknown>): string | null {
  const raw =
    (typeof fields.client_email === 'string' && fields.client_email) ||
    (typeof fields.ClientEmail === 'string' && fields.ClientEmail) ||
    (typeof fields.ClientName === 'string' && fields.ClientName.includes('@')
      ? fields.ClientName
      : '');
  const t = typeof raw === 'string' ? raw.trim() : '';
  return t.includes('@') ? t : null;
}

/**
 * Email 1 — payment confirmed (`sendOnboardingSequence` entry point for Stripe).
 */
export async function sendOnboardingSequence(bookingId: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn('[onboarding] RESEND_API_KEY not set; skipping sendOnboardingSequence');
    return;
  }

  const sbBookingId = bookingId.trim();
  const sb = getSupabaseServiceRole();
  const { data: bookingRow, error: bErr } = await sb
    .from('bookings')
    .select('id, brief_id')
    .eq('id', sbBookingId)
    .maybeSingle();
  if (bErr || !bookingRow) {
    console.warn('[onboarding] booking not found for sendOnboardingSequence', sbBookingId);
    return;
  }
  const briefId = String((bookingRow as { brief_id: string }).brief_id);
  const brief = await getBriefRecord(briefId);
  if (!brief.success) return;
  const fields = brief.data.fields as Record<string, unknown>;
  const projectTitle =
    typeof fields.ProjectTitle === 'string' ? fields.ProjectTitle : 'Your Spice Krewe project';
  const clientEmail = extractClientEmail(fields);
  if (!clientEmail) {
    console.warn('[onboarding] no client email on brief', briefId);
    return;
  }

  const origin = appOrigin().replace(/\/$/, '');
  const successUrl = `${origin}/hire/success?session_id=confirmed&id=${encodeURIComponent(sbBookingId)}`;

  const dedupKey = {
    entityType: 'booking',
    entityId: sbBookingId,
    type: 'onboarding_confirmed',
    recipient: clientEmail.toLowerCase(),
  };
  if (await wasEmailAlreadySent(dedupKey)) {
    // eslint-disable-next-line no-console
    console.info('[onboarding] duplicate send skipped (notification_log)', dedupKey);
    return;
  }

  await resend.emails.send({
    from: fromEmail(),
    to: clientEmail,
    subject: 'Your Spice Krewe booking is confirmed',
    html: `<p>Hi,</p>
<p>Your project <strong>${escapeHtml(projectTitle)}</strong> is confirmed.</p>
<p>We will match you with SK Verified talent shortly. If you need anything, reply to this email.</p>
<p><a href="${successUrl}">View your booking summary</a></p>`,
  });

  await recordEmailSent(dedupKey, { briefId, bookingId: sbBookingId });
}

/**
 * Email 3 — review request (call when a booking is closed).
 */
export async function sendReviewRequestEmail(bookingId: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn('[onboarding] RESEND_API_KEY not set; skipping sendReviewRequestEmail');
    return;
  }
  const sb = getSupabaseServiceRole();
  const { data: bookingRow, error: bErr } = await sb
    .from('bookings')
    .select('id, brief_id, secure_token')
    .eq('id', bookingId.trim())
    .maybeSingle();
  if (bErr || !bookingRow) return;
  const row = bookingRow as { brief_id: string; secure_token: string | null };
  const briefId = String(row.brief_id);
  if (!row.secure_token) return;
  const token = row.secure_token;
  const brief = await getBriefRecord(briefId);
  if (!brief.success) return;
  const fields = brief.data.fields as Record<string, unknown>;
  const clientEmail = extractClientEmail(fields);
  if (!clientEmail) return;

  const origin = appOrigin().replace(/\/$/, '');
  const q = (rating: string) =>
    `${origin}/api/match-feedback?bookingId=${encodeURIComponent(bookingId)}&rating=${rating}&token=${encodeURIComponent(token)}`;
  const good = q('good');
  const bad = q('bad');

  const dedupKey = {
    entityType: 'booking',
    entityId: bookingId.trim(),
    type: 'review_request',
    recipient: clientEmail.toLowerCase(),
  };
  if (await wasEmailAlreadySent(dedupKey)) {
    return;
  }

  await resend.emails.send({
    from: fromEmail(),
    to: clientEmail,
    subject: 'How did it go? Leave a quick review',
    html: `<p>Hi,</p>
<p>How was your Spice Krewe match?</p>
<p><a href="${good}">Good match</a> · <a href="${bad}">Not a good match</a></p>`,
  });

  await recordEmailSent(dedupKey, { briefId });
}

export async function sendOnboardingEmail1IfNeeded(briefId: string): Promise<void> {
  const brief = await getBriefRecord(briefId);
  if (!brief.success) return;
  const fields = brief.data.fields as Record<string, unknown>;
  const sent = fields.OnboardingEmail1SentAt ?? fields.onboarding_email_1_sent_at;
  if (typeof sent === 'string' && sent.trim()) {
    return;
  }
  const booking = await ensureBookingForBrief(briefId);
  if (!booking.success) return;
  await sendOnboardingSequence(booking.data.bookingId);
  await patchBriefRecord(briefId, {
    OnboardingEmail1SentAt: new Date().toISOString(),
  });
}
