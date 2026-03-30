import { Link, Navigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import BriefExplainer from '../../components/BriefExplainer';

const ALLOWED = ['recipe-developer'] as const;
type SpecialtySlug = (typeof ALLOWED)[number];

const CONFIG: Record<
  SpecialtySlug,
  {
    seoTitle: string;
    description: string;
    kicker: string;
    headline: string;
    sub: string;
    bullets: string[];
    ctaHref: string;
    ctaLabel: string;
  }
> = {
  'recipe-developer': {
    seoTitle: 'Hire Recipe Developer for CPG & Shelf-Stable R&D | Spice Krewe',
    description:
      'Recipe developers for CPG launch, nutritional science collaboration, and shelf-stability documentation—SK Verified Spice Krewe talent.',
    kicker: 'CPG · nutrition · scale-up',
    headline: 'Recipe development built for launch velocity',
    sub:
      'From bench trials to co-packer handoffs, our recipe developers align formulation, allergens, and process specs so your product survives scale—not just the first tasting.',
    bullets: [
      'CPG launch playbooks: specs, yields, and revision cycles your factory can execute',
      'Nutritional science alignment and label-ready documentation paths',
      'Shelf-stability testing narratives and risk flags before you commit to line time',
    ],
    ctaHref: '/hire',
    ctaLabel: 'Brief a recipe developer',
  },
};

function isSpecialtySlug(s: string | undefined): s is SpecialtySlug {
  return Boolean(s && (ALLOWED as readonly string[]).includes(s));
}

export default function HireSpecialtyPage() {
  const { specialty } = useParams<{ specialty: string }>();

  if (!isSpecialtySlug(specialty)) {
    return <Navigate to="/hire" replace />;
  }

  const c = CONFIG[specialty];

  return (
    <div className="min-h-screen bg-sk-body-bg flex flex-col">
      <SEO
        title={c.seoTitle}
        description={c.description}
        path={`/hire/${specialty}`}
        ogTitle={c.seoTitle}
        ogDescription={c.description}
      />
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <BriefExplainer className="mb-8" />
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sk-gold">{c.kicker}</p>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-sk-navy sm:text-4xl">{c.headline}</h1>
          <p className="mb-8 text-lg leading-relaxed text-sk-text-muted">{c.sub}</p>
          <ul className="mb-10 space-y-3 text-sk-text-muted">
            {c.bullets.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-spice-purple" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4">
            <Link
              to={c.ctaHref}
              className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md bg-spice-purple px-6 py-2.5 text-sm font-bold text-white no-underline shadow-md shadow-spice-purple/30 hover:bg-spice-blue"
            >
              {c.ctaLabel}
            </Link>
            <Link
              to="/talent"
              className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md border border-sk-card-border bg-white px-6 py-2.5 text-sm font-semibold text-spice-purple no-underline hover:bg-sk-purple-light/20"
            >
              Browse directory
            </Link>
            <Link
              to="/guides/pricing-2025"
              className="inline-flex min-h-[44px] items-center justify-center text-sm font-semibold text-sk-text-subtle no-underline underline-offset-4 hover:text-spice-purple hover:underline"
            >
              2025 rate guide
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
