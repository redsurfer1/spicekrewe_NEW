import { getSupabaseServiceRole } from './supabase';

export type TrdPipelineCounts = {
  pending: number;
  generating: number;
  complete: number;
  failed: number;
};

export type MatchQualitySummary = {
  good: number;
  bad: number;
  satisfactionPct: number | null;
};

export async function getTrdPipelineLast24h(): Promise<TrdPipelineCounts> {
  const empty: TrdPipelineCounts = { pending: 0, generating: 0, complete: 0, failed: 0 };
  try {
    const sb = getSupabaseServiceRole();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await sb.from('briefs').select('trd_status').gte('updated_at', since);
    if (error || !data) {
      return empty;
    }
    const rows = data as Array<{ trd_status?: string | null }>;
    const out = { ...empty };
    for (const r of rows) {
      const s = r.trd_status ?? 'pending';
      if (s === 'pending') out.pending += 1;
      else if (s === 'generating') out.generating += 1;
      else if (s === 'complete') out.complete += 1;
      else if (s === 'failed') out.failed += 1;
    }
    return out;
  } catch {
    return empty;
  }
}

export async function getMatchQualityLast30d(): Promise<MatchQualitySummary> {
  try {
    const sb = getSupabaseServiceRole();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await sb.from('match_feedback').select('rating').gte('created_at', since);
    if (error || !data) {
      return { good: 0, bad: 0, satisfactionPct: null };
    }
    const rows = data as Array<{ rating: boolean }>;
    let good = 0;
    let bad = 0;
    for (const r of rows) {
      if (r.rating) good += 1;
      else bad += 1;
    }
    const total = good + bad;
    const satisfactionPct = total === 0 ? null : Math.round((good / total) * 1000) / 10;
    return { good, bad, satisfactionPct };
  } catch {
    return { good: 0, bad: 0, satisfactionPct: null };
  }
}
