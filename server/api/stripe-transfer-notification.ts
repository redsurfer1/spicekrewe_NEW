/**
 * Stripe Connect transfer.created notification endpoint.
 * CLEAN MODEL: Notification only — no fund movement here.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getSupabaseServiceRole } from '../lib/supabase.js';
import { sendConciergeEmail } from '../lib/conciergeEmail.js';
import { logAuditEvent } from '../lib/auditLogger.js';
import { logSecurityIncident } from '../lib/securityIncidents.js';

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: string | Buffer) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET?.trim();
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!webhookSecret || !stripeSecretKey) {
    res.status(500).json({ error: 'Stripe Connect webhook is not configured' });
    return;
  }

  const sig = req.headers['stripe-signature'];
  if (!sig || typeof sig !== 'string') {
    res.status(400).json({ error: 'Missing Stripe-Signature header' });
    return;
  }

  const rawBody = await readRawBody(req);
  const stripe = new Stripe(stripeSecretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid webhook signature';
    void logSecurityIncident({
      incidentType: 'invalid_webhook_signature',
      severity: 'high',
      details: { source: 'stripe_connect_transfer', message: msg },
    });
    res.status(400).json({ error: msg });
    return;
  }

  if (event.type !== 'transfer.created') {
    res.status(200).json({ received: true, ignored: true });
    return;
  }

  const transfer = event.data.object as Stripe.Transfer;
  const amount = typeof transfer.amount === 'number' ? transfer.amount : 0;
  const providerId =
    typeof transfer.metadata?.provider_id === 'string'
      ? transfer.metadata.provider_id.trim()
      : typeof transfer.metadata?.providerId === 'string'
        ? transfer.metadata.providerId.trim()
        : '';

  try {
    let displayName = 'there';
    let providerEmail = '';

    const meta = (transfer.metadata ?? {}) as Record<string, string | undefined>;
    providerEmail = String(meta.provider_email ?? meta.notify_email ?? '').trim();

    if (providerId) {
      const sb = getSupabaseServiceRole();
      const { data: profile } = await sb.from('profiles').select('display_name').eq('id', providerId).maybeSingle();
      const row = profile as { display_name?: string | null } | null;
      if (row?.display_name) displayName = String(row.display_name);
    }

    const dollars = (amount / 100).toFixed(2);
    if (providerEmail.includes('@')) {
      await sendConciergeEmail({
        to: providerEmail,
        subject: 'Your SpiceKrewe payout is on its way',
        html: `<p>Hi ${displayName},</p><p>Your payment of <strong>$${dollars}</strong> has been released. Stripe payouts typically arrive in 2–3 business days.</p>`,
        dedup: {
          entityType: 'stripe_transfer',
          entityId: transfer.id,
          type: 'payout_notified',
          recipient: providerEmail.toLowerCase(),
        },
      });
    }

    void logAuditEvent({
      eventType: 'provider_payout_notified',
      actorType: 'webhook',
      entityType: 'profile',
      entityId: providerId || transfer.id,
      payload: { amount_cents: amount, transfer_id: transfer.id },
    });

    res.status(200).json({ received: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
}
