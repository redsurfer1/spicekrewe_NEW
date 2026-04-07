import { getSupabaseServiceRole } from './supabase.js';

export type ConciergeOutcomePayload = {
  /** Stripe event id when payment-driven; synthetic id for native concierge flows. */
  stripeEventId?: string | null;
  briefId?: string | null;
  packageId?: string | null;
  buyerId?: string | null;
  citySlug?: string | null;
  /** Per accepted package line — stored inside metadata JSONB for calibration. */
  providerTypes?: string[];
  metadata?: Record<string, unknown>;
};

/**
 * Persists a concierge package acceptance outcome for city-level calibration (Supabase table `concierge_outcomes`).
 * If the table is missing, logs and returns — no throw (webhook must stay 200).
 */
export async function logConciergeOutcome(payload: ConciergeOutcomePayload): Promise<void> {
  const sb = getSupabaseServiceRole();
  const meta = {
    ...(payload.metadata ?? {}),
    ...(payload.providerTypes?.length
      ? { providerTypes: payload.providerTypes }
      : {}),
  };

  const row = {
    stripe_event_id:
      payload.stripeEventId ??
      (payload.briefId ? `native:${payload.briefId}:${Date.now()}` : `native:concierge:${Date.now()}`),
    brief_id: payload.briefId ?? null,
    package_id: payload.packageId ?? null,
    buyer_id: payload.buyerId ?? null,
    city_slug: payload.citySlug ?? null,
    metadata: meta,
    created_at: new Date().toISOString(),
  };

  const { error } = await sb.from('concierge_outcomes').insert(row);
  if (error) {
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        audit: true,
        level: 'warn',
        event: 'concierge_outcome.insert_skipped',
        message: error.message,
        code: error.code,
      }),
    );
  }
}
