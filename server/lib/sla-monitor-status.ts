import { getSupabaseServiceRole } from './supabase';

export type SlaMonitorRunRow = {
  functionName: string;
  lastRunAt: string | null;
  lastStatus: string | null;
  failureCount: number;
  lastCorrelationId: string | null;
  lastError: string | null;
};

export async function getSlaMonitorStatus(): Promise<SlaMonitorRunRow | null> {
  try {
    const sb = getSupabaseServiceRole();
    const { data, error } = await sb
      .from('sla_monitor_runs')
      .select('function_name, last_run_at, last_status, failure_count, last_correlation_id, last_error')
      .eq('function_name', 'sla-monitor')
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    const r = data as {
      function_name: string;
      last_run_at: string | null;
      last_status: string | null;
      failure_count: number;
      last_correlation_id: string | null;
      last_error: string | null;
    };
    return {
      functionName: r.function_name,
      lastRunAt: r.last_run_at,
      lastStatus: r.last_status,
      failureCount: typeof r.failure_count === 'number' ? r.failure_count : 0,
      lastCorrelationId: r.last_correlation_id,
      lastError: r.last_error,
    };
  } catch {
    return null;
  }
}
