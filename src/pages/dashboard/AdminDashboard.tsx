import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import SpiceKreweWordmark from '../../components/SpiceKreweWordmark';
import { LayoutDashboard, Briefcase, Users, CheckCircle, TrendingUp, DollarSign, ExternalLink, ChevronLeft } from 'lucide-react';

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, signOut } = useAuth();
  const tab = searchParams.get('tab') || 'overview';

  const setTab = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  const getInitials = () => {
    const name = profile?.display_name || profile?.full_name || user?.email || '';
    return name.charAt(0).toUpperCase();
  };

  const renderTopBar = () => (
    <div className="bg-sk-navy h-14 flex items-center px-6 justify-between">
      <Link to="/">
        <SpiceKreweWordmark className="w-24 text-white" />
      </Link>
      <div className="w-10 h-10 rounded-full bg-sk-purple text-white text-sm font-medium flex items-center justify-center">
        {getInitials()}
      </div>
    </div>
  );

  const renderSidebar = () => {
    const navItems = [
      { icon: LayoutDashboard, label: 'Overview', tab: 'overview' },
      { icon: Briefcase, label: 'All projects', tab: 'projects' },
      { icon: Users, label: 'Talent', tab: 'talent' },
      { icon: Users, label: 'Buyers', tab: 'buyers' },
      { icon: CheckCircle, label: 'Match quality', tab: 'quality' },
      { icon: TrendingUp, label: 'TRD pipeline', tab: 'trd' },
      { icon: DollarSign, label: 'Payouts', tab: 'payouts' },
    ];

    return (
      <aside className="bg-white border-r border-sk-card-border flex flex-col h-full overflow-y-auto w-60">
        <div className="p-4 border-b border-sk-card-border">
          <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full mb-2">
            Admin
          </span>
          <div className="w-12 h-12 rounded-full bg-sk-purple text-white text-lg font-medium flex items-center justify-center">
            {getInitials()}
          </div>
          <p className="text-sm font-medium text-sk-navy mt-2">
            {profile?.display_name || profile?.full_name || 'Admin'}
          </p>
        </div>

        <nav className="flex-1 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.tab;

            return (
              <button
                key={item.tab}
                onClick={() => setTab(item.tab)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer transition ${
                  isActive
                    ? 'bg-sk-body-bg border-l-2 border-sk-purple text-sk-purple font-medium'
                    : 'text-sk-text-muted hover:bg-sk-body-bg hover:text-sk-navy'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}

          <a
            href="/admin/health"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-sk-text-muted hover:bg-sk-body-bg hover:text-sk-navy transition"
          >
            <ExternalLink size={18} />
            System health
          </a>
        </nav>

        <div className="p-4 border-t border-sk-card-border">
          <Link to="/" className="block text-xs text-sk-text-muted hover:text-sk-purple">
            <ChevronLeft size={12} className="inline" /> Back to site
          </Link>
          <button
            onClick={signOut}
            className="block text-xs text-red-500 mt-1 hover:text-red-700"
          >
            Sign out
          </button>
        </div>
      </aside>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {renderTopBar()}

      <div className="flex flex-row flex-1 h-[calc(100vh-56px)]">
        {renderSidebar()}

        <main className="flex-1 overflow-y-auto bg-sk-body-bg">
          <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-medium text-sk-navy mb-4">
              {tab === 'overview' && 'Admin Overview'}
              {tab === 'projects' && 'All Projects'}
              {tab === 'talent' && 'Talent Roster'}
              {tab === 'buyers' && 'Buyers'}
              {tab === 'quality' && 'Match Quality'}
              {tab === 'trd' && 'TRD Pipeline'}
              {tab === 'payouts' && 'Payouts & Revenue'}
            </h1>

            {tab === 'overview' && (
              <div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white border border-sk-card-border rounded-sk-lg p-4">
                    <p className="text-xs text-sk-text-muted mb-1">Total briefs</p>
                    <p className="text-2xl font-medium text-sk-navy">0</p>
                  </div>
                  <div className="bg-white border border-sk-card-border rounded-sk-lg p-4">
                    <p className="text-xs text-sk-text-muted mb-1">Matched</p>
                    <p className="text-2xl font-medium text-sk-navy">0</p>
                  </div>
                  <div className="bg-white border border-sk-card-border rounded-sk-lg p-4">
                    <p className="text-xs text-sk-text-muted mb-1">Completed</p>
                    <p className="text-2xl font-medium text-sk-navy">0</p>
                  </div>
                  <div className="bg-white border border-sk-card-border rounded-sk-lg p-4">
                    <p className="text-xs text-sk-text-muted mb-1">SLA breached</p>
                    <p className="text-2xl font-medium text-sk-navy">0</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setTab('projects')}
                    className="border border-sk-card-border text-sm px-4 py-2 rounded-sk-md hover:bg-white transition"
                  >
                    All projects
                  </button>
                  <button
                    onClick={() => setTab('talent')}
                    className="border border-sk-card-border text-sm px-4 py-2 rounded-sk-md hover:bg-white transition"
                  >
                    Talent roster
                  </button>
                  <a
                    href="/admin/health"
                    className="border border-sk-card-border text-sm px-4 py-2 rounded-sk-md hover:bg-white transition"
                  >
                    System health
                  </a>
                </div>
              </div>
            )}

            {tab === 'quality' && <QualityPanel />}

            {tab !== 'overview' && tab !== 'quality' && (
              <div className="bg-white rounded-sk-lg border border-sk-card-border p-8 text-center">
                <p className="text-sk-text-muted">This section is coming soon.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

type MatchQuality = {
  good: number;
  bad: number;
  satisfactionPct: number | null;
};


function QualityPanel() {
  const [quality, setQuality] = useState<MatchQuality | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin?action=health', {
          headers: { Accept: 'application/json' },
        });
        const json = (await res.json()) as { matchQuality?: MatchQuality; error?: string };
        if (!res.ok) {
          if (!cancelled) setError(json.error || res.statusText);
          return;
        }
        if (!cancelled) setQuality(json.matchQuality ?? null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load match quality');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const good = quality?.good ?? 0;
  const bad = quality?.bad ?? 0;
  const total = good + bad;
  const satisfaction =
    quality?.satisfactionPct != null ? `${quality.satisfactionPct.toFixed(1)}%` : '—';

  return (
    <div className="space-y-6">
      {loading && <p className="text-sm text-sk-text-muted">Loading match quality…</p>}
      {error && !loading && (
        <div className="rounded-sk-md border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div
            className={`rounded-sk-md border px-4 py-3 text-sm ${
              total < 50
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-emerald-300 bg-emerald-50 text-emerald-800'
            }`}
          >
            {total < 50 ? (
              <>
                Matchmaker weighting activates at <strong>50+</strong> ratings. Currently at{' '}
                <strong>{total}</strong> ratings.
              </>
            ) : (
              <>
                Matchmaker weighting is <strong>active</strong>. Total ratings:{' '}
                <strong>{total}</strong>.
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-sk-card-border rounded-sk-lg p-4">
              <p className="text-xs text-sk-text-muted mb-1">Good matches</p>
              <p className="text-2xl font-medium text-sk-navy">{good}</p>
            </div>
            <div className="bg-white border border-sk-card-border rounded-sk-lg p-4">
              <p className="text-xs text-sk-text-muted mb-1">Bad matches</p>
              <p className="text-2xl font-medium text-sk-navy">{bad}</p>
            </div>
            <div className="bg-white border border-sk-card-border rounded-sk-lg p-4">
              <p className="text-xs text-sk-text-muted mb-1">Satisfaction rate</p>
              <p className="text-2xl font-medium text-sk-navy">{satisfaction}</p>
            </div>
          </div>

          <div className="bg-white border border-dashed border-sk-card-border rounded-sk-lg p-4 text-sm text-sk-text-muted">
            Per-talent match feedback breakdown is not yet available in the API. Once the
            `match_feedback` schema includes per-talent aggregates, this panel will show:
            <br />
            <code className="text-xs bg-gray-100 px-1 rounded">
              Talent | Good | Bad | Score %
            </code>
            .
          </div>
        </>
      )}
    </div>
  );
}
