import { getSupabaseServiceRole } from './supabase';
import type { MatchmakerLogEntry } from './matchmakerLogStore';

function projectNameFromMessage(message: string): string {
  const m = /^MATCH (?:FOUND|PENDING):\s*(.+?)(?:\s+—|\s*$)/.exec(message);
  return m ? m[1].trim() : '';
}

/**
 * Persists matchmaker output to Postgres (G4 — durable audit; replaces cold-start loss from in-memory store).
 */
export async function persistMatchmakerLogToDb(
  entry: Omit<MatchmakerLogEntry, 'id' | 'at'>,
): Promise<void> {
  try {
    const sb = getSupabaseServiceRole();
    const { error } = await sb.from('matchmaker_logs').insert({
      brief_id: entry.briefId,
      message: entry.message,
      top_matches: entry.topMatches,
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.error(
        JSON.stringify({
          audit: true,
          level: 'error',
          event: 'matchmaker_log.persist_failed',
          briefId: entry.briefId,
          message: error.message,
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
        event: 'matchmaker_log.persist_exception',
        briefId: entry.briefId,
        message: msg,
      }),
    );
  }
}

export async function listMatchmakerLogsFromDb(limit = 25): Promise<MatchmakerLogEntry[]> {
  const n = Math.min(Math.max(limit, 1), 50);
  try {
    const sb = getSupabaseServiceRole();
    const { data, error } = await sb
      .from('matchmaker_logs')
      .select('id, brief_id, message, top_matches, created_at')
      .order('created_at', { ascending: false })
      .limit(n);
    if (error || !data) {
      return [];
    }
    return (data as Array<{
      id: string;
      brief_id: string;
      message: string;
      top_matches: unknown;
      created_at: string;
    }>).map((row) => ({
      id: row.id,
      at: row.created_at,
      briefId: row.brief_id,
      projectName: projectNameFromMessage(row.message),
      message: row.message,
      topMatches: Array.isArray(row.top_matches)
        ? (row.top_matches as Array<{ id: string; name: string; score: number }>)
        : [],
    }));
  } catch {
    return [];
  }
}
