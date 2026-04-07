import type Stripe from 'stripe';
import { handleCheckoutSessionCompleted } from './webhook-checkout-completed.js';
import { sendOnboardingEmail1IfNeeded } from '../email/onboarding-sequence.js';
import {
  registerWebhookFlow,
  dispatchWebhookFlow,
  type WebhookFlowContext,
} from './webhookFlowRegistry.js';
import { logConciergeOutcome } from './conciergeOutcome.js';
import { getSupabaseServiceRole } from './supabase.js';

function metaString(obj: Record<string, unknown> | undefined, key: string): string {
  const v = obj?.[key];
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * After a successful chef or food-truck checkout session, record subscriber personalization
 * when the buyer has an active subscription. Failures are logged only — webhook must stay 200.
 */
async function maybeInsertSubscriberHistory(
  session: Stripe.Checkout.Session,
  flow: 'chef_booking' | 'food_truck_booking',
): Promise<void> {
  try {
    const md = (session.metadata ?? undefined) as Record<string, unknown> | undefined;
    const buyerId = metaString(md, 'buyerId') || metaString(md, 'buyer_id');
    const providerId = metaString(md, 'providerId');
    const citySlug = metaString(md, 'citySlug') || 'memphis';

    if (!buyerId) {
      return;
    }

    const sb = getSupabaseServiceRole();
    const { data: subscription, error: subscriptionError } = await sb
      .from('subscriptions')
      .select('id, city_slug')
      .eq('buyer_id', buyerId)
      .eq('status', 'active')
      .maybeSingle();

    if (subscriptionError) {
      const msg = subscriptionError.message ?? '';
      if (
        subscriptionError.code === '42P01' ||
        (typeof msg === 'string' && msg.includes('does not exist'))
      ) {
        // eslint-disable-next-line no-console
        console.warn(
          '[SubscriberHistory] subscriptions table not found. Deferred to month 6.',
        );
        return;
      }
      // eslint-disable-next-line no-console
      console.error('[SubscriberHistory] subscription lookup failed', subscriptionError);
      return;
    }

    if (!subscription) {
      return;
    }

    await sb.from('subscriber_history').insert({
      buyer_id: buyerId,
      city_slug: citySlug,
      provider_type: flow === 'food_truck_booking' ? 'food_truck' : 'private_chef',
      provider_id: providerId || null,
      completed_at: new Date().toISOString(),
      metadata: {
        session_id: session.id,
        flow,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SubscriberHistory] insert failed', err);
  }
}

/**
 * Register SpiceKrewe Stripe flows. Call once at module load.
 */
export function registerStripeWebhookFlows(): void {
  registerWebhookFlow('chef_booking', async ({ stripeEventId, rawObject }) => {
    const session = rawObject as unknown as Stripe.Checkout.Session;
    await handleCheckoutSessionCompleted(session, stripeEventId);
    await maybeInsertSubscriberHistory(session, 'chef_booking');
  });

  registerWebhookFlow('food_truck_booking', async ({ stripeEventId, rawObject }) => {
    const session = rawObject as unknown as Stripe.Checkout.Session;
    // Same brief + booking pipeline; distinguish analytics via flow name in metadata.
    await handleCheckoutSessionCompleted(session, stripeEventId);
    await maybeInsertSubscriberHistory(session, 'food_truck_booking');
  });

  registerWebhookFlow('concierge_fee', async ({ stripeEventId, rawObject }) => {
    const pi = rawObject as unknown as Stripe.PaymentIntent;
    const md = (pi.metadata ?? undefined) as Record<string, unknown> | undefined;
    const briefId = metaString(md, 'briefId') || metaString(md, 'brief_id');
    const packageId = metaString(md, 'packageId') || metaString(md, 'package_id');
    const buyerId = metaString(md, 'buyerId') || metaString(md, 'buyer_id');
    const citySlug = metaString(md, 'citySlug') || metaString(md, 'city_slug');
    const providerType = metaString(md, 'providerType');
    let providerTypes: string[] | undefined;
    const pts = metaString(md, 'providerTypes');
    if (pts) {
      try {
        const parsed = JSON.parse(pts) as unknown;
        if (Array.isArray(parsed)) providerTypes = parsed.map((x) => String(x));
      } catch {
        /* ignore */
      }
    }
    await logConciergeOutcome({
      stripeEventId,
      briefId: briefId || null,
      packageId: packageId || null,
      buyerId: buyerId || null,
      citySlug: citySlug || null,
      providerTypes,
      metadata: {
        ...(md ?? {}),
        providerType: providerType || undefined,
      },
    });
    if (briefId) {
      await sendOnboardingEmail1IfNeeded(briefId);
    }
  });

  registerWebhookFlow('subscription', async ({ stripeEventId, rawObject }) => {
    try {
      // Stub until subscription PaymentIntents ship — keep idempotent audit log only.
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({
          audit: true,
          level: 'info',
          event: 'stripe.flow.subscription.stub',
          stripeEventId,
          objectId: (rawObject as { id?: string }).id ?? null,
        }),
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[subscription webhook]', err);
      // Never rethrow — Stripe webhook must return 200.
    }
  });
}

export async function tryDispatchCheckoutSession(
  session: Stripe.Checkout.Session,
  stripeEventId: string,
): Promise<boolean> {
  const flow = metaString(session.metadata as Record<string, unknown>, 'flow');
  const ctx: WebhookFlowContext = { stripeEventId, rawObject: session as unknown as Record<string, unknown> };
  const res = await dispatchWebhookFlow(flow, ctx);
  return res.handled;
}

export async function tryDispatchPaymentIntent(
  pi: Stripe.PaymentIntent,
  stripeEventId: string,
): Promise<boolean> {
  const flow = metaString(pi.metadata as Record<string, unknown>, 'flow');
  const ctx: WebhookFlowContext = { stripeEventId, rawObject: pi as unknown as Record<string, unknown> };
  const res = await dispatchWebhookFlow(flow, ctx);
  return res.handled;
}
