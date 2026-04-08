import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { validateServerEnv } from '../lib/env-validator.js';
import { readBearerToken, verifyAdminToken } from '../lib/admin-token.js';
import {
  listRecentBriefsForHealth,
  measureSupabaseLatencyMs,
  pingSupabaseBriefs,
} from '../lib/supabase-brief.js';
import type { BriefAuditRow } from '../lib/supabase-brief.js';
import { getRecentMatchmakerLogs } from '../lib/matchmakerAlerts.js';
import { listMatchmakerLogsFromDb } from '../lib/matchmakerLogDb.js';
import { getMatchQualityLast30d, getTrdPipelineLast24h } from '../lib/health-metrics.js';
import { evaluateStripeCheckoutTrdHealth } from '../lib/stripe-checkout-health.js';
import { getSlaMonitorStatus } from '../lib/sla-monitor-status.js';
import { DATA_PROTECTION_POSTURE_VERSION } from '../lib/crypto.js';

function cors(res: VercelResponse, origin: string | undefined): void {
  const allow = process.env.SERVER_ALLOWED_ORIGIN?.trim() || origin || '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  cors(res, origin);

  try {
    validateServerEnv();
  } catch (e) {
    res.status(500).json({ error: (e instanceof Error ? e.message : 'Server misconfigured') });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const window15m = 15 * 60 * 1000;
  const limited = await rateLimiter.check(req, res, 'admin-health', {
    windowMs: window15m,
    maxRequests: 60,
  });
  if (limited) return;

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
  const recent = await listRecentBriefsForHealth(5);
  const trdPipeline = await getTrdPipelineLast24h();
  const matchQuality = await getMatchQualityLast30d();
  const [stripeCheckoutPipeline, slaMonitor] = await Promise.all([
    evaluateStripeCheckoutTrdHealth(),
    getSlaMonitorStatus(),
  ]);

  let matchmakerLogs = await listMatchmakerLogsFromDb(25);
  if (matchmakerLogs.length === 0) {
    matchmakerLogs = getRecentMatchmakerLogs(25);
  }

  const pipelineStatus =
    stripeCheckoutPipeline.status === 'CRITICAL'
      ? 'CRITICAL'
      : stripeCheckoutPipeline.status === 'DEGRADED'
        ? 'DEGRADED'
        : stripeCheckoutPipeline.status === 'UNKNOWN'
          ? 'UNKNOWN'
          : 'OK';

  let supabaseDetail: string | undefined;
  if (!supabasePing.success) {
    supabaseDetail = supabasePing.error.message;
  }

  let recentBriefsError: string | undefined;
  if (!recent.success) {
    recentBriefsError = recent.error.message;
  }

  res.status(200).json({
    generatedAt: new Date().toISOString(),
    supabase: {
      status: supabasePing.success ? 'connected' : 'error',
      detail: supabaseDetail,
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
    recentBriefsError,
    matchmakerLogs,
    trdPipeline,
    matchQuality,
    stripeCheckoutPipeline,
    slaMonitor,
    pipelineStatus,
    dataProtection: {
      postureVersion: DATA_PROTECTION_POSTURE_VERSION,
      transit: 'TLS 1.2+ (prefer TLS 1.3 at edge); see server/lib/crypto.ts',
      atRest: 'Supabase AES-256 at rest; see server/lib/crypto.ts',
    },
  });
}
