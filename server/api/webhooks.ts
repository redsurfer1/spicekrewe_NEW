import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { handleCheckoutSessionCompleted } from '../lib/webhook-checkout-completed';
import { sendOnboardingEmail1IfNeeded } from '../email/onboarding-sequence';

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
    res.status(405).end('Method Not Allowed');
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!webhookSecret || !stripeSecretKey) {
    res.status(500).json({ error: 'Stripe webhook is not configured' });
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
    res.status(400).json({ error: msg });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const applied = await handleCheckoutSessionCompleted(session, event.id);
    if (!applied.success) {
      res.status(500).json({ error: applied.error.message });
      return;
    }
    // SOC2 audit trail — Stripe event id + brief id (no card data).
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        audit: true,
        level: 'info',
        event: 'stripe.checkout.session.completed',
        stripeEventId: event.id,
        briefId: session.client_reference_id ?? null,
        paymentStatus: session.payment_status,
      }),
    );
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const briefId = typeof pi.metadata?.briefId === 'string' ? pi.metadata.briefId.trim() : '';
    if (briefId) {
      await sendOnboardingEmail1IfNeeded(briefId);
    }
  }

  res.status(200).json({ received: true });
}
