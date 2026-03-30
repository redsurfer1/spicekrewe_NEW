/**
 * Companion test invocation:
 *   supabase functions invoke onboarding-email-2
 *
 * Sends the 72h check-in email for paid briefs (Resend). Cron: hourly (see supabase/config.toml).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { writeAuditError } from '../_shared/audit.ts';

const RESEND_KEY = Deno.env.get('RESEND_API_KEY')?.trim();
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL')?.trim() ?? 'hello@spicekrewe.com';

Deno.serve(async () => {
  const correlationId = crypto.randomUUID();
  const url = Deno.env.get('SUPABASE_URL')?.trim();
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim();

  if (!url || !key || !RESEND_KEY) {
    return new Response(JSON.stringify({ error: 'Missing env', correlationId }), { status: 500 });
  }

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await sb
      .from('briefs')
      .select('id, client_name, project_title, paid_at, onboarding_email_2_sent_at, payment_status')
      .eq('payment_status', 'paid')
      .not('paid_at', 'is', null)
      .lt('paid_at', cutoff)
      .is('onboarding_email_2_sent_at', null);

    if (error) {
      throw new Error(error.message);
    }

    const list = (rows ?? []) as Array<{
      id: string;
      client_name: string | null;
      project_title: string | null;
    }>;

    let sent = 0;
    for (const b of list) {
      const email =
        typeof b.client_name === 'string' && b.client_name.includes('@')
          ? b.client_name.trim()
          : null;
      if (!email) {
        continue;
      }
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject: 'How is your project going?',
          html: `<p>Hi,</p><p>Checking in on <strong>${(b.project_title ?? 'your project').replace(/</g, '')}</strong>.</p>
<p>If your needs changed, you can post a new brief. Reply to this email for support.</p>`,
        }),
      });
      if (!r.ok) {
        throw new Error(`Resend HTTP ${r.status}`);
      }
      const { error: uErr } = await sb
        .from('briefs')
        .update({ onboarding_email_2_sent_at: new Date().toISOString() })
        .eq('id', b.id);
      if (uErr) {
        throw new Error(uErr.message);
      }
      sent += 1;
    }

    return new Response(JSON.stringify({ ok: true, sent, correlationId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    try {
      await writeAuditError(sb, { correlationId, source: 'onboarding-email-2', message: msg, detail: {} });
    } catch {
      // best-effort
    }
    return new Response(JSON.stringify({ error: msg, correlationId }), { status: 500 });
  }
});
