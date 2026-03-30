/**
 * Companion test invocation (Supabase CLI):
 *   supabase functions invoke auto-scoper --body '{"brief_id":"00000000-0000-4000-8000-000000000000"}'
 *
 * Production TRD generation runs on Stripe `checkout.session.completed` via Vercel
 * (`server/lib/webhook-checkout-completed.ts` + `server/lib/ai/autoScoper.ts`).
 * This Edge Function is a no-op placeholder so deploys can wire a dedicated worker later.
 */

Deno.serve(() =>
  new Response(
    JSON.stringify({
      ok: true,
      note: 'TRD is generated in Vercel on successful Featured checkout; see webhook-checkout-completed.',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  ),
);
