import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Database, Radio, ShieldCheck, Timer, Users } from 'lucide-react';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { clearAdminSession, isAdminMfaVerified, readAdminToken } from '../../lib/adminSession';

type MatchmakerLogRow = {
  id: string;
  at: string;
  briefId: string;
  projectName: string;
  message: string;
  topMatches: Array<{ id: string; name: string; score: number }>;
};

type HealthPayload = {
  generatedAt: string;
  supabase: { status: string; detail?: string; latencyMs?: number };
  stripeWebhook: { status: string; listener: string };
  recentBriefSyncs: Array<{
    recordIdSuffix: string;
    createdTime: string | null;
    projectTitle: string;
    clientName: string;
    predictiveMatchSummary?: string;
  }>;
  recentBriefsError?: string;
  matchmakerLogs?: MatchmakerLogRow[];
  trdPipeline?: {
    pending: number;
    generating: number;
    complete: number;
    failed: number;
  };
  matchQuality?: {
    good: number;
    bad: number;
    satisfactionPct: number | null;
  };
  pipelineStatus?: string;
  stripeCheckoutPipeline?: {
    status: string;
    detail?: string;
    recent: Array<{
      stripeEventId: string;
      briefId: string | null;
      paymentPaid: boolean;
      trdStatus: string | null;
      workflowStatus: string | null;
      flags: string[];
    }>;
  };
  slaMonitor?: {
    functionName: string;
    lastRunAt: string | null;
    lastStatus: string | null;
    failureCount: number;
    lastCorrelationId: string | null;
    lastError: string | null;
  } | null;
  dataProtection?: {
    postureVersion: string;
    transit: string;
    atRest: string;
  };
  secretsHealth?: {
    configured: string[];
    missing: string[];
  };
};

function apiPath(p: string): string {
  const base = import.meta.env.VITE_APP_ORIGIN?.replace(/\/$/, '') ?? '';
  return `${base}${p}`;
}

function pipelineBadgeClass(status: string | undefined): string {
  if (status === 'CRITICAL') return 'text-red-700';
  if (status === 'DEGRADED') return 'text-amber-700';
  if (status === 'UNKNOWN') return 'text-gray-600';
  return 'text-green-700';
}

export default function AdminHealthPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<HealthPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = readAdminToken();
    if (!token) {
      navigate('/admin', { replace: true });
      return;
    }
    if (!isAdminMfaVerified()) {
      navigate('/admin/mfa-verify', { replace: true });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiPath('/api/admin/health'), {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.status === 401) {
        clearAdminSession();
        navigate('/admin', { replace: true });
        return;
      }
      const json = (await res.json()) as HealthPayload & { error?: string };
      if (!res.ok) {
        setError(json.error || res.statusText);
        setData(null);
        return;
      }
      // Fetch secrets health in parallel
      const secretsRes = await fetch(apiPath('/api/admin/secrets-health'), {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      let secretsHealth: HealthPayload['secretsHealth'] | undefined;
      if (secretsRes.ok) {
        const sjson = (await secretsRes.json()) as {
          configured?: string[];
          missing?: string[];
        };
        secretsHealth = {
          configured: sjson.configured ?? [],
          missing: sjson.missing ?? [],
        };
      }

      setData({ ...json, secretsHealth });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load health');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const stripe = data?.stripeCheckoutPipeline;
  const sla = data?.slaMonitor;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <SEO title="System Health – Spice Krewe Admin" path="/admin/health" />
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-8 w-8 text-spice-purple" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System health</h1>
            <p className="text-sm text-gray-600">Flomisma-standard operational view (admin only).</p>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading status…</p>
        ) : error ? (
          <div className="rounded-sk-md border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-sk-md border border-sk-card-border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-spice-purple" aria-hidden />
                  <h2 className="font-semibold text-gray-900">Stripe × TRD pipeline</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Last 5 <code className="text-xs bg-gray-100 px-1 rounded">checkout.session.completed</code>
                  :{' '}
                  <strong className={pipelineBadgeClass(data.pipelineStatus ?? stripe?.status)}>
                    {data.pipelineStatus ?? stripe?.status ?? '—'}
                  </strong>
                </p>
                {stripe?.detail ? (
                  <p className="mt-2 text-xs text-gray-500">{stripe.detail}</p>
                ) : null}
                {stripe?.recent?.length ? (
                  <ul className="mt-3 text-xs text-gray-600 space-y-1 font-mono">
                    {stripe.recent.map((r) => (
                      <li key={r.stripeEventId}>
                        {r.stripeEventId.slice(0, 14)}… paid={String(r.paymentPaid)} trd=
                        {r.trdStatus ?? '—'} {r.flags.length ? `[${r.flags.join(', ')}]` : ''}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="rounded-sk-md border border-sk-card-border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-5 w-5 text-spice-blue" aria-hidden />
                  <h2 className="font-semibold text-gray-900">SLA monitor (Edge)</h2>
                </div>
                {sla ? (
                  <p className="text-sm text-gray-600">
                    Last run:{' '}
                    <strong>{sla.lastRunAt ? new Date(sla.lastRunAt).toISOString() : '—'}</strong>
                    <br />
                    Status: <strong>{sla.lastStatus ?? '—'}</strong> · Failures:{' '}
                    <strong className={sla.failureCount > 0 ? 'text-amber-700' : ''}>{sla.failureCount}</strong>
                    {sla.lastError ? (
                      <span className="block mt-2 text-xs text-red-700 break-words">{sla.lastError}</span>
                    ) : null}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    No <code className="text-xs bg-gray-100 px-1 rounded">sla_monitor_runs</code> row yet (function
                    must run once after migration).
                  </p>
                )}
              </div>
            </div>

            {data.dataProtection ? (
              <div className="rounded-sk-md border border-sk-card-border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5 text-spice-blue" aria-hidden />
                  <h2 className="font-semibold text-gray-900">Data protection posture (G16)</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Version <strong>{data.dataProtection.postureVersion}</strong> — see{' '}
                  <code className="text-xs bg-gray-100 px-1 rounded">server/lib/crypto.ts</code>.
                </p>
                <p className="text-xs text-gray-500 mt-2">{data.dataProtection.transit}</p>
                <p className="text-xs text-gray-500">{data.dataProtection.atRest}</p>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-sk-md border border-sk-card-border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-spice-purple" aria-hidden />
                  <h2 className="font-semibold text-gray-900">TRD pipeline (24h)</h2>
                </div>
                <p className="text-sm text-gray-600">
                  {data.trdPipeline ? (
                    <>
                      pending: <strong>{data.trdPipeline.pending}</strong> | generating:{' '}
                      <strong>{data.trdPipeline.generating}</strong> | complete:{' '}
                      <strong>{data.trdPipeline.complete}</strong> | failed:{' '}
                      <strong>{data.trdPipeline.failed}</strong>
                    </>
                  ) : (
                    '—'
                  )}
                </p>
              </div>

              <div className="rounded-sk-md border border-sk-card-border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5 text-spice-blue" aria-hidden />
                  <h2 className="font-semibold text-gray-900">Match quality (30d)</h2>
                </div>
                <p className="text-sm text-gray-600">
                  {data.matchQuality ? (
                    <>
                      Last 30 days: <strong>{data.matchQuality.good}</strong> good /{' '}
                      <strong>{data.matchQuality.bad}</strong> bad
                      {data.matchQuality.satisfactionPct != null ? (
                        <>
                          {' '}
                          / <strong>{data.matchQuality.satisfactionPct}%</strong> satisfaction
                        </>
                      ) : null}
                    </>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-sk-md border border-sk-card-border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5 text-spice-purple" aria-hidden />
                  <h2 className="font-semibold text-gray-900">Supabase (PostgreSQL)</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Status:{' '}
                  <strong className={data.supabase.status === 'connected' ? 'text-green-700' : 'text-red-700'}>
                    {data.supabase.status}
                  </strong>
                  {typeof data.supabase.latencyMs === 'number' ? (
                    <span className="text-gray-500"> · ~{data.supabase.latencyMs}ms probe</span>
                  ) : null}
                </p>
                {data.supabase.detail ? (
                  <p className="mt-2 text-xs text-gray-500 break-words">{data.supabase.detail}</p>
                ) : null}
              </div>

              <div className="rounded-sk-md border border-sk-card-border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="h-5 w-5 text-spice-blue" aria-hidden />
                  <h2 className="font-semibold text-gray-900">Secrets health</h2>
                </div>
                <p className="text-sm text-gray-600">
                  {data.secretsHealth ? (
                    <>
                      Configured:{' '}
                      {data.secretsHealth.configured.length
                        ? data.secretsHealth.configured.join(', ')
                        : 'none'}
                      <br />
                      Missing:{' '}
                      {data.secretsHealth.missing.length
                        ? data.secretsHealth.missing.join(', ')
                        : 'none'}
                    </>
                  ) : (
                    '—'
                  )}
                </p>
              </div>

              <div className="rounded-sk-md border border-sk-card-border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="h-5 w-5 text-spice-blue" aria-hidden />
                  <h2 className="font-semibold text-gray-900">Stripe webhooks</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Listener:{' '}
                  <strong>{data.stripeWebhook.listener}</strong> ({data.stripeWebhook.status})
                </p>
              </div>
            </div>

            <div className="rounded-sk-md border border-sk-card-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-spice-blue" aria-hidden />
                <h2 className="font-semibold text-gray-900">Predictive matchmaker log</h2>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Durable rows in <code className="text-xs bg-gray-100 px-1 rounded">matchmaker_logs</code> (G4); in-memory
                fallback only when the table is empty. TRD skills vs roster; SMS/email hooks stubbed.
              </p>
              {!data.matchmakerLogs || data.matchmakerLogs.length === 0 ? (
                <p className="text-sm text-gray-600">No entries yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100 space-y-0">
                  {data.matchmakerLogs.map((row) => (
                    <li key={row.id} className="py-3 text-sm">
                      <p className="font-medium text-gray-900">{row.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(row.at).toISOString()} · brief {row.briefId.slice(0, 12)}…
                        {row.topMatches?.length ? (
                          <span className="ml-2">
                            Scores:{' '}
                            {row.topMatches.map((m) => `${m.name} (${m.score})`).join(' · ')}
                          </span>
                        ) : null}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-sk-md border border-sk-card-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-spice-purple" aria-hidden />
                <h2 className="font-semibold text-gray-900">Recent brief syncs (PII obfuscated)</h2>
              </div>
              {data.recentBriefsError ? (
                <p className="text-sm text-amber-800">{data.recentBriefsError}</p>
              ) : data.recentBriefSyncs.length === 0 ? (
                <p className="text-sm text-gray-600">No recent rows returned (empty table or new base).</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {data.recentBriefSyncs.map((row) => (
                    <li key={row.recordIdSuffix} className="py-3 text-sm flex flex-col gap-1">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-gray-500">…{row.recordIdSuffix}</span>
                        <span className="text-gray-800">{row.projectTitle}</span>
                        <span className="text-gray-600">{row.clientName}</span>
                        <span className="text-gray-400 text-xs">
                          {row.createdTime ? new Date(row.createdTime).toISOString() : '—'}
                        </span>
                      </div>
                      {row.predictiveMatchSummary ? (
                        <p className="text-xs text-spice-purple font-medium pl-0">{row.predictiveMatchSummary}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-gray-500">Generated at {data.generatedAt}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/admin" className="text-spice-purple font-semibold">
                ← Admin home
              </Link>
              <button
                type="button"
                className="text-gray-600 underline"
                onClick={() => {
                  clearAdminSession();
                  navigate('/admin');
                }}
              >
                Log out
              </button>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
