import { getSupabaseServiceRole } from './supabase.js';

export type EmailDedupKey = {
  entityType: string;
  entityId: string;
  type: string;
  recipient: string;
};

/**
 * Flomisma-pattern guard: skip send if an identical notification was already logged (webhook retries / cron overlap).
 * Requires table `notification_log` with columns: entity_type, entity_id, type, recipient, metadata (jsonb), created_at.
 */
export async function wasEmailAlreadySent(key: EmailDedupKey): Promise<boolean> {
  try {
    const sb = getSupabaseServiceRole();
    const { data: rows, error } = await sb
      .from('notification_log')
      .select('id')
      .eq('entity_type', key.entityType)
      .eq('entity_id', key.entityId)
      .eq('type', key.type)
      .eq('recipient', key.recipient)
      .limit(1);
    if (error) {
      // eslint-disable-next-line no-console
      console.warn('[emailDedup] notification_log read failed', error.message);
      return false;
    }
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

export async function recordEmailSent(
  key: EmailDedupKey,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const sb = getSupabaseServiceRole();
    await sb.from('notification_log').insert({
      entity_type: key.entityType,
      entity_id: key.entityId,
      type: key.type,
      recipient: key.recipient,
      metadata: metadata ?? {},
    });
  } catch {
    /* non-fatal */
  }
}
