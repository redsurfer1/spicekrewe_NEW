import Stripe from 'stripe';
import { z } from 'zod';
import type { Result } from './result.js';

export type CheckoutFlow =
  | 'chef_booking'
  | 'food_truck_booking'
  | 'concierge_fee'
  | 'subscription';

const BodySchema = z.object({
  briefId: z.string().min(1, 'briefId is required'),
  amountUsd: z.number().finite().positive(),
  stripePublishableKey: z.string().optional(),
  metadata: z.record(z.string()).optional().default({}),
  flow: z
    .enum(['chef_booking', 'food_truck_booking', 'concierge_fee', 'subscription'])
    .optional()
    .default('chef_booking'),
});

const SUCCESS_URL = 'https://spicekrewe.com/hire/success?session_id={CHECKOUT_SESSION_ID}';
const CANCEL_URL = 'https://spicekrewe.com/hire';

export type CheckoutBody = z.infer<typeof BodySchema>;

export function parseCheckoutBody(raw: unknown): Result<CheckoutBody, Error> {
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join('; ');
    return { success: false, error: new Error(msg) };
  }
  return { success: true, data: parsed.data };
}

export async function createStripeCheckoutSession(body: CheckoutBody): Promise<Result<{ url: string }, Error>> {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    return { success: false, error: new Error('STRIPE_SECRET_KEY is not configured') };
  }

  const stripe = new Stripe(secret);

  const { briefId, amountUsd, metadata, flow } = body;
  const flowValue: CheckoutFlow = flow ?? 'chef_booking';
  const unitAmountCents = Math.round(amountUsd * 100);
  if (unitAmountCents < 50) {
    return { success: false, error: new Error('amountUsd too small for Stripe (min $0.50)') };
  }

  const sessionMetadata: Record<string, string> = {
    ...metadata,
    briefId: briefId.trim(),
    /** Used by webhooks to confirm Featured matching checkout → Auto-Scoper TRD sync. */
    spiceKreweCheckout: 'featured_matching',
    flow: flowValue,
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: briefId.trim().slice(0, 200),
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      metadata: sessionMetadata,
      payment_intent_data: {
        metadata: {
          briefId: briefId.trim(),
          spiceKreweCheckout: 'featured_matching',
          flow: flowValue,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: unitAmountCents,
            product_data: {
              name: 'Featured matching — Spice Krewe Lab',
              description: 'Prioritized placement and concierge matching for your project brief.',
            },
          },
        },
      ],
    });

    const url = session.url;
    if (!url) {
      return { success: false, error: new Error('Stripe did not return a checkout URL') };
    }

    return { success: true, data: { url } };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err };
  }
}
