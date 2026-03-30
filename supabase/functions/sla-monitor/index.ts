/**
 * Companion test invocation:
 *   supabase functions invoke sla-monitor
 *
 * Hourly cron: flags paid briefs still unmatched after 48h (see supabase/config.toml).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { writeAuditError, finishSlaMonitorRun } from '../_shared/audit.ts';

const SLACK_URL = Deno.env.get('SLACK_WEBHOOK_URL')?.trim();
const ADMIN_EMAIL = Deno.env.get('ADMIN_ALERT_EMAIL')?.trim();
const RESEND_KEY = Deno.env.get('RESEND_API_KEY')?.trim();
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL')?.trim() ?? 'hello@spicekrewe.com';

Deno.serve(async () => {
  const correlationId = crypto.randomUUID();
  const url = Deno.env.get('SUPABASE_URL')?.trim();
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim();

  if (!url || !key) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env', correlationId }), { status: 500 });
  }

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await sb
      .from('briefs')
      .select('id, client_name, project_title, required_skills, created_at, paid_at, workflow_status, payment_status')
      .eq('payment_status', 'paid')
      .in('workflow_status', ['active', 'matching'])
      .not('paid_at', 'is', null)
      .lt('paid_at', cutoff);

    if (error) {
      throw new Error(error.message);
    }

    const breached = (rows ?? []) as Array<{
      id: string;
      client_name: string | null;
      project_title: string | null;
      required_skills: string | null;
      created_at: string | null;
      paid_at: string | null;
    }>;

    if (breached.length === 0) {
      await finishSlaMonitorRun(sb, true, correlationId);
      return new Response(JSON.stringify({ ok: true, breached: 0, correlationId }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lines = breached.map(
      (b) =>
        `• ${b.id} | ${b.client_name ?? 'client'} | ${b.project_title ?? 'project'} | paid ${b.paid_at ?? '—'} | skills ${(b.required_skills ?? '').slice(0, 120)}`,
    );
    const bodyText = `SLA breach (48h, no terminal match): ${breached.length}\n${lines.join('\n')}`;

    if (SLACK_URL) {
      const r = await fetch(SLACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bodyText }),
      });
      if (!r.ok) {
        throw new Error(`Slack webhook HTTP ${r.status}`);
      }
    } else if (ADMIN_EMAIL && RESEND_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL],
          subject: 'Spice Krewe: SLA breach alert',
          text: bodyText,
        }),
      });
      if (!r.ok) {
        throw new Error(`Resend HTTP ${r.status}`);
      }
    }

    for (const b of breached) {
      const { error: uErr } = await sb.from('briefs').update({ workflow_status: 'sla_breached' }).eq('id', b.id);
      if (uErr) {
        throw new Error(uErr.message);
      }
    }

    await finishSlaMonitorRun(sb, true, correlationId);
    return new Response(JSON.stringify({ ok: true, breached: breached.length, correlationId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    try {
      await writeAuditError(sb, { correlationId, source: 'sla-monitor', message: msg, detail: {} });
      await finishSlaMonitorRun(sb, false, correlationId, msg);
    } catch {
      // best-effort audit
    }
    return new Response(JSON.stringify({ error: msg, correlationId }), { status: 500 });
  }
});
