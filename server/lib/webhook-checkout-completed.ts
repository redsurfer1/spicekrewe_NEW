import type Stripe from 'stripe';
import type { Result } from './result';
import { getBriefRecord, isBriefMarkedPaid, patchBriefRecord } from './supabase-brief';
import {
  buildFallbackTrd,
  formatTrdForAirtable,
  generateTechnicalRequirementsDocument,
} from './ai/autoScoper';
import { runPredictiveMatchmakerAfterFeaturedPayment } from './matchmakerAlerts';
import { ensureBookingForBrief } from './bookings';

function alreadyProcessedEvent(fields: Record<string, unknown>, stripeEventId: string): boolean {
  const prev = fields.StripeLastWebhookEventId ?? fields.stripeLastWebhookEventId;
  return typeof prev === 'string' && prev === stripeEventId;
}

/** Featured matching checkout — triggers Auto-Scoper after payment. Legacy sessions without metadata are treated as featured. */
function isFeaturedMatchingCheckout(session: Stripe.Checkout.Session): boolean {
  const v = session.metadata?.spiceKreweCheckout;
  if (v === undefined || v === '') return true;
  return v === 'featured_matching';
}

/**
 * After successful Featured payment: generate TRD via Gemini and write to `technical_requirements` (JSONB).
 * Failures are logged; payment state is not rolled back.
 */
async function syncTechnicalRequirementsFromBrief(
  briefId: string,
  fields: Record<string, unknown>,
): Promise<void> {
  const existing =
    fields.TechnicalRequirements ?? fields.technicalRequirements ?? fields.technical_requirements;
  if (typeof existing === 'string' && existing.trim().length > 0) {
    return;
  }
  if (existing && typeof existing === 'object' && !Array.isArray(existing) && Object.keys(existing).length > 0) {
    return;
  }

  const raw = fields.Description ?? fields.description;
  const description = typeof raw === 'string' ? raw : '';
  if (!description.trim()) {
    return;
  }

  await patchBriefRecord(briefId, { TrdStatus: 'generating' });

  const trdResult = await generateTechnicalRequirementsDocument(description);
  const trd = trdResult.success ? trdResult.data : buildFallbackTrd(description);
  if (!trdResult.success) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        audit: true,
        level: 'warn',
        event: 'auto_scoper.gemini_failed',
        briefId,
        message: trdResult.error.message,
      }),
    );
  }

  const payload = formatTrdForAirtable(trd);
  const patched = await patchBriefRecord(briefId, {
    TechnicalRequirements: payload,
    TrdStatus: 'complete',
  });

  if (!patched.success) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        audit: true,
        level: 'error',
        event: 'auto_scoper.brief_patch_failed',
        briefId,
        message: patched.error.message,
      }),
    );
    await patchBriefRecord(briefId, { TrdStatus: 'failed' });
  } else {
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        audit: true,
        level: 'info',
        event: 'auto_scoper.trd_synced',
        briefId,
        estimatedRdHours: trd.estimatedRdHours,
      }),
    );
  }
}

async function runFeaturedMatchmakerPipeline(briefId: string): Promise<void> {
  const latest = await getBriefRecord(briefId);
  if (!latest.success) return;
  await runPredictiveMatchmakerAfterFeaturedPayment(
    briefId,
    latest.data.fields as Record<string, unknown>,
  );
}

/**
 * Apply Supabase `briefs` updates for a completed Checkout session.
 * Idempotent: skips duplicate Stripe event deliveries and already-paid briefs.
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripeEventId: string,
): Promise<Result<{ skipped: boolean; briefId: string }, Error>> {
  const briefId = session.client_reference_id?.trim();
  if (!briefId) {
    return { success: false, error: new Error('Missing client_reference_id on Checkout Session') };
  }

  if (session.payment_status !== 'paid') {
    return { success: true, data: { skipped: true, briefId } };
  }

  const existing = await getBriefRecord(briefId);
  if (!existing.success) {
    return existing;
  }

  const fields = existing.data.fields as Record<string, unknown>;

  if (alreadyProcessedEvent(fields, stripeEventId)) {
    return { success: true, data: { skipped: true, briefId } };
  }

  if (isBriefMarkedPaid(fields)) {
    return { success: true, data: { skipped: true, briefId } };
  }

  const paidAt = new Date().toISOString();
  const withEventId = await patchBriefRecord(briefId, {
    PaymentStatus: 'Paid',
    IsActive: true,
    PaidAt: paidAt,
    WorkflowStatus: 'active',
    StripeLastWebhookEventId: stripeEventId,
    stripe_checkout_session_id: session.id,
  });

  if (withEventId.success) {
    await ensureBookingForBrief(briefId);
    if (isFeaturedMatchingCheckout(session)) {
      await syncTechnicalRequirementsFromBrief(briefId, fields);
      await runFeaturedMatchmakerPipeline(briefId);
    }
    return { success: true, data: { skipped: false, briefId } };
  }

  const fallback = await patchBriefRecord(briefId, {
    PaymentStatus: 'Paid',
    IsActive: true,
    PaidAt: paidAt,
    WorkflowStatus: 'active',
  });

  if (!fallback.success) {
    return fallback;
  }

  if (isFeaturedMatchingCheckout(session)) {
    await ensureBookingForBrief(briefId);
    const refreshed = await getBriefRecord(briefId);
    const nextFields = refreshed.success ? (refreshed.data.fields as Record<string, unknown>) : fields;
    await syncTechnicalRequirementsFromBrief(briefId, nextFields);
    await runFeaturedMatchmakerPipeline(briefId);
  }

  return { success: true, data: { skipped: false, briefId } };
}
