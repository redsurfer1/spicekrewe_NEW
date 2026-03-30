import Stripe from 'stripe';
import { getBriefRecord } from './supabase-brief';

export type StripeTrdPipelineStatus = 'OK' | 'DEGRADED' | 'CRITICAL' | 'UNKNOWN';

export type StripeCheckoutHealthPayload = {
  status: StripeTrdPipelineStatus;
  detail?: string;
  recent: Array<{
    stripeEventId: string;
    briefId: string | null;
    paymentPaid: boolean;
    trdStatus: string | null;
    workflowStatus: string | null;
    flags: string[];
  }>;
};

/**
 * G1/G2: Sample recent Stripe `checkout.session.completed` events and cross-check brief TRD/payment state.
 */
export async function evaluateStripeCheckoutTrdHealth(): Promise<StripeCheckoutHealthPayload> {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    return {
      status: 'UNKNOWN',
      detail: 'STRIPE_SECRET_KEY not configured',
      recent: [],
    };
  }

  const stripe = new Stripe(secret);
  let events: Stripe.Event[];
  try {
    const list = await stripe.events.list({
      type: 'checkout.session.completed',
      limit: 5,
    });
    events = list.data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      status: 'CRITICAL',
      detail: `Stripe events list failed: ${msg}`,
      recent: [],
    };
  }

  const recent: StripeCheckoutHealthPayload['recent'] = [];
  let critical = false;
  let degraded = false;

  for (const ev of events) {
    const session = ev.data.object as Stripe.Checkout.Session;
    const briefId = session.client_reference_id?.trim() ?? null;
    const paymentPaid = session.payment_status === 'paid';
    const flags: string[] = [];
    let trdStatus: string | null = null;
    let workflowStatus: string | null = null;

    if (briefId && paymentPaid) {
      const brief = await getBriefRecord(briefId);
      if (!brief.success) {
        flags.push('brief_not_found');
        critical = true;
      } else {
        const f = brief.data.fields as Record<string, unknown>;
        trdStatus =
          typeof f.trd_status === 'string'
            ? f.trd_status
            : typeof f.TrdStatus === 'string'
              ? f.TrdStatus
              : null;
        workflowStatus =
          typeof f.workflow_status === 'string'
            ? f.workflow_status
            : typeof f.WorkflowStatus === 'string'
              ? f.WorkflowStatus
              : null;

        const tr = f.technical_requirements ?? f.TechnicalRequirements;
        const hasTrd =
          (tr && typeof tr === 'object' && !Array.isArray(tr) && Object.keys(tr as object).length > 0) ||
          (typeof tr === 'string' && tr.trim().startsWith('{'));

        if (trdStatus === 'failed') {
          flags.push('trd_failed');
          critical = true;
        } else if (paymentPaid && !hasTrd && trdStatus !== 'complete' && trdStatus !== 'pending') {
          flags.push('trd_missing_or_stale');
          degraded = true;
        } else if (paymentPaid && trdStatus === 'generating') {
          flags.push('trd_generating');
          degraded = true;
        }
      }
    }

    recent.push({
      stripeEventId: ev.id,
      briefId,
      paymentPaid,
      trdStatus,
      workflowStatus,
      flags,
    });
  }

  const status: StripeTrdPipelineStatus = critical ? 'CRITICAL' : degraded ? 'DEGRADED' : 'OK';

  return {
    status,
    detail:
      status === 'CRITICAL'
        ? 'One or more recent paid checkouts have missing briefs or failed TRD state'
        : status === 'DEGRADED'
          ? 'TRD still generating or incomplete for a recent paid checkout — monitor'
          : undefined,
    recent,
  };
}
