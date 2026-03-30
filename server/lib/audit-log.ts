import { randomUUID } from 'node:crypto';
import { getSupabaseServiceRole } from './supabase';

export type AuditLevel = 'error' | 'warn' | 'info';

/**
 * Server-side audit row (mirrors public.audit_log). Service role only.
 */
export async function writeAuditLog(params: {
  source: string;
  level: AuditLevel;
  message: string;
  correlationId?: string;
  detail?: Record<string, unknown>;
}): Promise<void> {
  const correlationId = params.correlationId ?? randomUUID();
  try {
    const sb = getSupabaseServiceRole();
    const { error } = await sb.from('audit_log').insert({
      correlation_id: correlationId,
      source: params.source.slice(0, 120),
      level: params.level,
      message: params.message.slice(0, 8000),
      detail: params.detail ?? {},
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.error(
        JSON.stringify({
          audit: true,
          level: 'error',
          event: 'audit_log.write_failed',
          source: params.source,
          message: error.message,
          correlationId,
        }),
      );
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        audit: true,
        level: 'error',
        event: 'audit_log.write_exception',
        source: params.source,
        message: msg,
        correlationId,
      }),
    );
  }
}
