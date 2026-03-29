import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readBearerToken, verifyAdminToken } from '../../server/lib/admin-token';
import {
  listRecentBriefsForAudit,
  measureSupabaseLatencyMs,
  pingSupabaseBriefs,
} from '../../server/lib/supabase-brief';
import type { BriefAuditRow } from '../../server/lib/supabase-brief';
import { getRecentMatchmakerLogs } from '../../server/lib/matchmakerAlerts';

function cors(res: VercelResponse, origin: string | undefined): void {
  const allow = process.env.SERVER_ALLOWED_ORIGIN?.trim() || origin || '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  cors(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = readBearerToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const stripeWebhookOk = Boolean(
    process.env.STRIPE_WEBHOOK_SECRET?.trim() && process.env.STRIPE_SECRET_KEY?.trim(),
  );

  const supabasePing = await pingSupabaseBriefs();
  const latency = await measureSupabaseLatencyMs();
  const recent = await listRecentBriefsForAudit(5);

  res.status(200).json({
    generatedAt: new Date().toISOString(),
    supabase: {
      status: supabasePing.success ? 'connected' : 'error',
      detail: supabasePing.success ? undefined : supabasePing.error.message,
      latencyMs: latency.success ? latency.data : undefined,
    },
    stripeWebhook: {
      status: stripeWebhookOk ? 'configured' : 'not_configured',
      listener: stripeWebhookOk ? 'active' : 'inactive',
    },
    recentBriefSyncs: recent.success
      ? recent.data.map((r: BriefAuditRow) => ({
          recordIdSuffix: r.recordId.replace(/-/g, '').slice(-6),
          createdTime: r.createdTime,
          projectTitle: r.projectTitleObfuscated,
          clientName: r.clientNameObfuscated,
          predictiveMatchSummary: r.predictiveMatchSummary,
        }))
      : [],
    recentBriefsError: recent.success ? undefined : recent.error.message,
    matchmakerLogs: getRecentMatchmakerLogs(25),
  });
}
