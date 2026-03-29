import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Database, Radio, ShieldCheck, Users } from 'lucide-react';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

const TOKEN_KEY = 'sk_admin_token';

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
};

function apiPath(p: string): string {
  const base = import.meta.env.VITE_APP_ORIGIN?.replace(/\/$/, '') ?? '';
  return `${base}${p}`;
}

export default function AdminHealthPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<HealthPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate('/admin', { replace: true });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiPath('/api/admin/health'), {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        navigate('/admin', { replace: true });
        return;
      }
      const json = (await res.json()) as HealthPayload & { error?: string };
      if (!res.ok) {
        setError(json.error || res.statusText);
        setData(null);
        return;
      }
      setData(json);
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
                Shown after a Featured brief is paid (TRD skills vs roster). SMS/email hooks are stubbed for SendGrid/Twilio.
              </p>
              {!data.matchmakerLogs || data.matchmakerLogs.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No in-process entries yet (cold starts clear memory).                 After payment, lines also sync to Supabase{' '}
                  <code className="text-xs bg-gray-100 px-1 rounded">predictive_match_summary</code> when the column is present.
                </p>
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
                  sessionStorage.removeItem(TOKEN_KEY);
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
