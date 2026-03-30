import { Link } from 'react-router-dom';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO, { DEFAULT_OG_IMAGE } from '../../components/SEO';
import BriefExplainer from '../../components/BriefExplainer';
import TalentCard from '../../components/TalentCard';
import { TALENT_FALLBACK } from '../../data/talent';
import { buildProfessionalServiceStructuredData } from '../../lib/seo/professionalServiceJsonLd';

const TITLE = 'Hire a freelance food stylist | Spice Krewe';
const DESCRIPTION =
  'Vetted food stylists for product photography, e-commerce, and campaigns. SK Verified hourly anchors $150–$190/hr.';
const PATH = '/hire/food-stylist';

export default function FoodStylistHirePage() {
  const structuredData = buildProfessionalServiceStructuredData({
    pageName: TITLE,
    pageDescription: DESCRIPTION,
    path: PATH,
    serviceName: 'Food styling for brands',
    serviceDescription:
      'Freelance food stylists for editorial, e-commerce, and advertising shoots—SK Verified Spice Krewe network.',
    areaServed: 'US',
  });

  const cards = TALENT_FALLBACK.filter((p) => ['rafael-cruz', 'dana-nguyen', 'aisha-thompson'].includes(p.id));

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
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <BriefExplainer className="mb-8" />
          <h1 className="mb-4 text-3xl font-bold leading-tight text-sk-navy sm:text-4xl">
            Hire a freelance food stylist for product photography
          </h1>
          <p className="mb-2 text-lg text-sk-text-muted leading-relaxed">
            Editorial, e-commerce, and campaign-ready sets—with SK Verified professionals who understand brand legal and
            edible-safe workflows.
          </p>
          <p className="mb-6 text-sm text-sk-text-subtle">
            Compare rates in{' '}
            <Link to="/blog/food-stylist-cost" className="font-semibold text-spice-purple no-underline hover:underline">
              food stylist day rates explained
            </Link>
            .
          </p>
          <Link
            to="/hire"
            className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md bg-spice-purple px-6 py-2.5 text-sm font-bold text-white no-underline shadow-md hover:bg-spice-blue"
          >
            Post a project brief
          </Link>
        </div>

        <section className="mx-auto mt-14 max-w-4xl">
          <h2 className="mb-4 text-2xl font-bold text-sk-navy">What a food stylist does</h2>
          <p className="text-sk-text-muted leading-relaxed">
            Stylists own the plate—props, hero angle, pour timing, and on-set discipline. Photographers own lighting and
            capture. Many CPG launches need <strong className="text-sk-navy">both</strong>; some PDP refreshes need a
            stylist who can hand off to your in-house photo team.
          </p>
        </section>

        <section className="mx-auto mt-12 max-w-6xl">
          <h2 className="mb-6 text-2xl font-bold text-sk-navy">Editorial vs e-commerce vs advertising</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Editorial',
                body: 'Story-first frames, faster shot counts, lighter licensing layers.',
              },
              {
                title: 'E-commerce',
                body: 'SKU consistency, repeatable surfaces, PDP-ready crops at scale.',
              },
              {
                title: 'Advertising',
                body: 'Hero durability across crops, motion hooks, agency revision loops.',
              },
            ].map((c) => (
              <div key={c.title} className="rounded-sk-lg border border-sk-card-border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-sk-navy">{c.title}</h3>
                <p className="mt-2 text-sm text-sk-text-muted leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-3xl rounded-sk-lg border border-sk-gold/40 bg-sk-gold-light/30 p-6">
          <h2 className="text-lg font-bold text-sk-navy">SK Verified rate context</h2>
          <p className="mt-2 text-sm text-sk-text-muted leading-relaxed">
            Published SK Verified anchors sit between <strong className="text-sk-navy">$150/hr and $190/hr</strong> on the
            network (Rafael Cruz at $150/hr; Marcus Johnson $175/hr; Aisha Thompson $165/hr; Dana Nguyen $190/hr). National
            freelance <strong>day</strong> surveys often land near <strong>$400–$1,000/day</strong> before props—use both
            frames when budgeting.
          </p>
        </section>

        <section className="mx-auto mt-14 max-w-6xl">
          <h2 className="mb-8 text-2xl font-bold text-sk-navy">Featured food stylists &amp; set partners</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {cards.map((p) => (
              <TalentCard key={p.id} professional={p} appendTalentIdQuery />
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-3xl">
          <h2 className="mb-3 text-xl font-bold text-sk-navy">Frequently asked question</h2>
          <p className="font-medium text-sk-navy">Do I need a food stylist and a photographer?</p>
          <p className="mt-2 text-sm text-sk-text-muted leading-relaxed">
            For hero campaigns and national retail, usually yes. For minimal pack shots with brand-approved templates, you
            might start with one discipline—brief the gap honestly so scope stays honest.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
