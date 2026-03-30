import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Sparkles, Users } from 'lucide-react';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO, { DEFAULT_OG_IMAGE } from '../../components/SEO';
import BriefExplainer from '../../components/BriefExplainer';
import TalentCard from '../../components/TalentCard';
import { TALENT_FALLBACK } from '../../data/talent';
import { buildProfessionalServiceStructuredData } from '../../lib/seo/professionalServiceJsonLd';

const TITLE = 'On-demand culinary consultant — hire R&D chef | Spice Krewe';
const DESCRIPTION =
  'Hire a vetted R&D chef or flavor consultant per project—no retainer. SK Verified $150–$190/hr anchors. Match in about 48 hours.';
const PATH = '/hire/culinary-consultant';

function SkVerifiedBadge() {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: '#fef8e7', borderColor: '#f9cc52', color: '#8a6200' }}
    >
      SK Verified
    </span>
  );
}

export default function CulinaryConsultantHirePage() {
  const structuredData = buildProfessionalServiceStructuredData({
    pageName: TITLE,
    pageDescription: DESCRIPTION,
    path: PATH,
    serviceName: 'Culinary Consulting',
    serviceDescription:
      'On-demand research chefs and culinary R&D consultants for food brands—SK Verified, per-project engagements, US-wide.',
    areaServed: 'US',
  });

  const featured = TALENT_FALLBACK.filter((p) => ['dana-nguyen', 'marcus-johnson', 'aisha-thompson'].includes(p.id));

  return (
    <div className="flex min-h-screen flex-col bg-sk-body-bg">
      <SEO
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        ogTitle={TITLE}
        ogDescription={DESCRIPTION}
        image={DEFAULT_OG_IMAGE}
        structuredData={structuredData}
      />
      <Navbar />
      <main className="flex-1">
        <section
          className="border-b border-sk-card-border px-4 py-14 sm:px-6 lg:px-8"
          style={{ background: 'var(--sk-navy)', color: '#fff' }}
        >
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl">
              On-demand culinary consultants — no retainer, no long-term contracts
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed" style={{ color: 'var(--sk-muted-purple)' }}>
              Hire a vetted R&amp;D chef or flavor consultant for your food brand. Match in about 48 hours. Pay per
              project—not a six-month agency lock-in.
            </p>
            <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
              <SkVerifiedBadge />
              <span className="text-sm text-white/80">48-hour match window on scoped briefs</span>
            </div>
            <Link
              to="/hire"
              className="inline-flex min-h-[48px] items-center justify-center rounded-sk-md px-8 py-3 text-sm font-bold text-white no-underline"
              style={{ background: 'var(--sk-purple)' }}
            >
              Post a project brief
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <BriefExplainer />
        </section>

        <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-bold text-sk-navy">Zero-headcount R&amp;D</h2>
          <p className="mb-4 text-sk-text-muted leading-relaxed">
            In-house R&amp;D often clears <strong className="text-sk-navy">$120K+/yr</strong> before benefits. Consulting
            firms may lock you into multi-month retainers before the first bench trial. Spice Krewe lets you{' '}
            <strong className="text-sk-navy">hire one verified consultant per project</strong>—with governance that
            satisfies procurement, not just creative.
          </p>
          <p className="mb-8 text-sk-text-muted leading-relaxed">
            Looking for pricing context first? Read{' '}
            <Link to="/blog/culinary-consultant-guide" className="font-semibold text-spice-purple no-underline hover:underline">
              what does a culinary consultant cost?
            </Link>{' '}
            in our consultant guide.
          </p>

          <h3 className="mb-4 text-lg font-bold text-sk-navy">Auto-Scoper: brief → TRD → matched consultant</h3>
          <p className="mb-6 text-sm text-sk-text-muted leading-relaxed">
            When you post a brief, the <strong className="text-sk-navy">Gemini Auto-Scoper</strong> drafts a technical
            requirements document (TRD)—a production-ready scope your matched consultant uses from day one.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: '1', title: 'Brief', body: 'You describe cuisine, dietary gates, deliverables, timeline, budget.', icon: FileText },
              { step: '2', title: 'TRD', body: 'Auto-Scoper structures scope into food-native requirements.', icon: Sparkles },
              { step: '3', title: 'Match', body: 'Ranked SK Verified consultants align to the TRD within ~48 hours.', icon: Users },
            ].map(({ step, title, body, icon: Icon }) => (
              <div
                key={step}
                className="flex flex-col rounded-sk-lg border border-sk-card-border bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-sk-md text-white" style={{ background: 'var(--sk-purple)' }}>
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-sk-gold">Step {step}</p>
                <p className="mt-1 font-semibold text-sk-navy">{title}</p>
                <p className="mt-2 text-sm text-sk-text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-sk-card-border bg-white px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-2xl font-bold text-sk-navy">Who our culinary consultants work on</h2>
            <ul className="m-0 list-none space-y-6 p-0">
              <li>
                <h3 className="text-lg font-semibold text-sk-navy">CPG / food brand product launches</h3>
                <p className="mt-1 text-sm text-sk-text-muted leading-relaxed">
                  Bench-to-shelf documentation with co-packer-ready language. Outcome: fewer surprise reformulations at
                  line trial.
                </p>
              </li>
              <li>
                <h3 className="text-lg font-semibold text-sk-navy">Clean label reformulation</h3>
                <p className="mt-1 text-sm text-sk-text-muted leading-relaxed">
                  Ingredient swaps with sensory guardrails. Outcome: label claims that survive QA review.
                </p>
              </li>
              <li>
                <h3 className="text-lg font-semibold text-sk-navy">Bench-to-production scaling</h3>
                <p className="mt-1 text-sm text-sk-text-muted leading-relaxed">
                  Yield, viscosity, and process notes for scale-up. See our{' '}
                  <Link to="/blog/culinary-consultant-guide" className="font-semibold text-spice-purple no-underline hover:underline">
                    culinary consultant guide
                  </Link>{' '}
                  for when to hire vs build in-house.
                </p>
              </li>
              <li>
                <h3 className="text-lg font-semibold text-sk-navy">Beverage R&amp;D and flavor development</h3>
                <p className="mt-1 text-sm text-sk-text-muted leading-relaxed">
                  Flavor maps and tasting panels for drinks programs. Outcome: a documented sensory target—not just a
                  one-off winner batch.
                </p>
              </li>
              <li>
                <h3 className="text-lg font-semibold text-sk-navy">Restaurant menu innovation</h3>
                <p className="mt-1 text-sm text-sk-text-muted leading-relaxed">
                  LTO engineering with labor-aware builds. Outcome: menus operators can execute without hidden prep
                  debt.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-sk-navy">How SK compares</h2>
          <p className="mb-4 text-sm text-sk-text-muted">
            Targets searches like <em>CuliNEX alternative</em> and <em>freelance food consultant vs consulting firm</em>
            —same rigor, more flexible commercial shape.
          </p>
          <div className="overflow-x-auto rounded-sk-lg border border-sk-card-border bg-white shadow-sm">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-sk-card-border bg-sk-purple-light/10">
                  <th className="p-3 font-bold text-sk-navy"> </th>
                  <th className="p-3 font-bold text-sk-navy">Spice Krewe</th>
                  <th className="p-3 font-bold text-sk-navy">Agency retainer</th>
                  <th className="p-3 font-bold text-sk-navy">Upwork (unvetted)</th>
                </tr>
              </thead>
              <tbody className="text-sk-text-muted">
                <tr className="border-b border-sk-card-border">
                  <td className="p-3 font-semibold text-sk-navy">Vetting</td>
                  <td className="p-3">SK Verified</td>
                  <td className="p-3">High (team)</td>
                  <td className="p-3">Variable / self-reported</td>
                </tr>
                <tr className="border-b border-sk-card-border">
                  <td className="p-3 font-semibold text-sk-navy">Contract length</td>
                  <td className="p-3">Per project</td>
                  <td className="p-3">Often 6+ months</td>
                  <td className="p-3">Per gig</td>
                </tr>
                <tr className="border-b border-sk-card-border">
                  <td className="p-3 font-semibold text-sk-navy">Turnaround</td>
                  <td className="p-3">~48 hr match</td>
                  <td className="p-3">Onboarding + SOW cycles</td>
                  <td className="p-3">Depends on individual</td>
                </tr>
                <tr className="border-b border-sk-card-border">
                  <td className="p-3 font-semibold text-sk-navy">IP ownership</td>
                  <td className="p-3">Defined in brief</td>
                  <td className="p-3">MSA/SOW dependent</td>
                  <td className="p-3">Often unclear</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-sk-navy">Pricing model</td>
                  <td className="p-3">$150–$190/hr anchors</td>
                  <td className="p-3">Retainer + fees</td>
                  <td className="p-3">Race to lowest bid</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-t border-sk-card-border bg-sk-body-bg px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-sk-navy">Featured consultants</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {featured.map((p) => (
                <TalentCard key={p.id} professional={p} appendTalentIdQuery />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-xl px-4 py-12 text-center">
          <Link
            to="/hire"
            className="inline-flex items-center gap-2 text-sm font-bold text-spice-purple no-underline hover:underline"
          >
            Post a project brief <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
