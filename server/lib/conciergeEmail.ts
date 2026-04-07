/**
 * conciergeEmail.ts
 *
 * SpiceKrewe native transactional email helpers for concierge flows.
 * Core pattern: Flomisma engine (Resend + dedup).
 */

import { Resend } from 'resend';
import { recordEmailSent, wasEmailAlreadySent, type EmailDedupKey } from './emailDedup.js';

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

function fromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || 'hello@spicekrewe.com';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendConciergeEmail(params: {
  to: string;
  subject: string;
  html: string;
  dedup: EmailDedupKey;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  try {
    const to = params.to.trim().toLowerCase();
    if (!to.includes('@')) return false;
    if (await wasEmailAlreadySent(params.dedup)) {
      return false;
    }
    const resend = getResend();
    if (!resend) {
      // eslint-disable-next-line no-console
      console.warn('[conciergeEmail] RESEND_API_KEY not set; skipping send');
      await recordEmailSent(params.dedup, { skipped: true, ...params.metadata });
      return false;
    }
    await resend.emails.send({
      from: fromEmail(),
      to,
      subject: params.subject,
      html: params.html,
    });
    await recordEmailSent(params.dedup, params.metadata ?? {});
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[conciergeEmail] send failed', e);
    return false;
  }
}

export { escapeHtml };
