import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import TalentCard from '../../components/TalentCard';
import { fetchTalentDirectory } from '../../data/talent';
import type { TalentRecord } from '../../types/talentRecord';

const PAGE_TITLE = 'Private Chef Memphis & event catering Memphis | Spice Krewe';
const PAGE_DESCRIPTION =
  'Hire SK Verified private chefs and event catering professionals in Memphis. Memphis Event Planning data-as-a-service for hosts building in the Mid-South.';

/** Highlight professionals suited to private-chef and event intents for local landing copy. */
function memphisHighlights(roster: TalentRecord[]): TalentRecord[] {
  const want = new Set(['Private Chef', 'Recipe Development', 'Food Styling', 'Menu Design']);
  const scored = roster
    .map((p) => ({
      p,
      n: p.tags.reduce((acc, t) => acc + (want.has(t) ? 1 : 0), 0),
    }))
    .filter(({ n }) => n > 0)
    .sort((a, b) => b.n - a.n);
  return scored.slice(0, 4).map(({ p }) => p);
}

export default function MemphisLocationPage() {
  const [roster, setRoster] = useState<TalentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTalentDirectory().then((list) => {
      if (!cancelled) {
        setRoster(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const highlights = useMemo(() => memphisHighlights(roster), [roster]);

  return (
    <div className="min-h-screen bg-sk-body-bg flex flex-col">
      <SEO
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        path="/locations/memphis"
        ogTitle={PAGE_TITLE}
        ogDescription={PAGE_DESCRIPTION}
      />
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sk-gold">Locations</p>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-sk-navy sm:text-5xl">
            Private Chef Memphis · Culinary R&amp;D Memphis
          </h1>
          <p className="mb-6 max-w-3xl text-lg leading-relaxed text-sk-text-muted">
            Spice Krewe anchors verified talent and brief intelligence in the Mid-South. Whether you need an on-site
            private chef experience or bench-ready culinary R&amp;D, we route Memphis-aligned professionals through the
            same COS rails as national enterprise teams.
          </p>

          <section
            className="mb-12 rounded-sk-lg border border-sk-card-border bg-white p-6 shadow-sm sm:p-8"
            aria-labelledby="mfi-heading"
          >
            <h2 id="mfi-heading" className="mb-3 text-xl font-bold text-sk-navy">
              Memphis Event Planning (data-as-a-service)
            </h2>
            <p className="mb-0 text-[15px] leading-relaxed text-sk-text-muted">
              Our <strong className="text-sk-navy">Memphis Event Planning</strong> layer packages anonymized, machine-readable
              preference signals from Krewe tastings, pop-ups, and partner menus—so hosts can stress-test concepts against
              real Mid-South palates before they commit to line extensions or LTOs. Pair index insights with an SK Verified
              brief to move from signal to scoped execution in one thread.
            </p>
          </section>

          <h2 className="mb-6 text-2xl font-bold text-sk-navy">Memphis-area professionals on the network</h2>
          {loading ? (
            <p className="text-sk-text-muted">Loading directory…</p>
          ) : highlights.length === 0 ? (
            <p className="text-sk-text-muted">
              No highlights available.{' '}
              <Link to="/talent" className="font-semibold text-spice-purple no-underline hover:underline">
                Browse all talent
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((professional) => (
                <TalentCard key={professional.id} professional={professional} appendTalentIdQuery />
              ))}
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              to="/hire"
              className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md bg-spice-purple px-6 py-2.5 text-sm font-bold text-white no-underline shadow-md shadow-spice-purple/30 hover:bg-spice-blue"
            >
              Post a Memphis brief
            </Link>
            <Link
              to="/contact#message"
              className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md border border-sk-card-border bg-white px-6 py-2.5 text-sm font-semibold text-spice-purple no-underline hover:bg-sk-purple-light/20"
            >
              Talk to partnerships
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
