/**
 * G8: Centralized audit + SLA heartbeat for Edge Functions (service_role bypasses RLS on audit_log / sla_monitor_runs).
 */
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

export async function writeAuditError(
  sb: SupabaseClient,
  params: {
    correlationId: string;
    source: string;
    message: string;
    detail?: Record<string, unknown>;
  },
): Promise<void> {
  await sb.from('audit_log').insert({
    correlation_id: params.correlationId,
    source: params.source,
    level: 'error',
    message: params.message,
    detail: params.detail ?? {},
  });
}

export async function finishSlaMonitorRun(
  sb: SupabaseClient,
  ok: boolean,
  correlationId: string,
  errorMessage?: string,
): Promise<void> {
  const now = new Date().toISOString();
  if (ok) {
    await sb.from('sla_monitor_runs').upsert(
      {
        function_name: 'sla-monitor',
        last_run_at: now,
        last_status: 'ok',
        failure_count: 0,
        last_correlation_id: correlationId,
        last_error: null,
        updated_at: now,
      },
      { onConflict: 'function_name' },
    );
    return;
  }
  const { data } = await sb
    .from('sla_monitor_runs')
    .select('failure_count')
    .eq('function_name', 'sla-monitor')
    .maybeSingle();
  const row = data as { failure_count?: number } | null;
  const prev = typeof row?.failure_count === 'number' ? row.failure_count : 0;
  await sb.from('sla_monitor_runs').upsert(
    {
      function_name: 'sla-monitor',
      last_run_at: now,
      last_status: 'error',
      failure_count: prev + 1,
      last_correlation_id: correlationId,
      last_error: errorMessage ?? 'unknown',
      updated_at: now,
    },
    { onConflict: 'function_name' },
  );
}
