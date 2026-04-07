import { Link } from 'react-router-dom';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

const PAGE_TITLE = 'How much does a private chef or food truck cost in Memphis? | SpiceKrewe';
const PAGE_DESCRIPTION =
  'Typical private chef and food truck pricing in Memphis, plus how SpiceKrewe’s 5% booking fee works.';

const fontBarlow = '"Barlow Condensed", system-ui, sans-serif';
const primary = '#4d2f91';

export default function PricingGuide2025Page() {
  return (
    <div className="min-h-screen bg-sk-body-bg flex flex-col">
      <SEO
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        path="/guides/pricing-2025"
        ogTitle={PAGE_TITLE}
        ogDescription={PAGE_DESCRIPTION}
      />
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-sk-lg border border-sk-card-border bg-white p-6 shadow-sm sm:p-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sk-gold">Guides</p>
          <h1
            className="m-0 mb-4 text-3xl font-extrabold leading-tight text-sk-navy sm:text-4xl"
            style={{ fontFamily: fontBarlow }}
          >
            How much does a private chef or food truck cost in Memphis?
          </h1>
          <p className="m-0 mb-10 text-lg leading-relaxed text-sk-text-muted">
            Transparent ranges help you plan — final quotes depend on your guest count, menu, date, and service style.
          </p>

          <section className="mb-10">
            <h2 className="m-0 mb-3 text-xl font-bold text-sk-navy" style={{ fontFamily: fontBarlow }}>
              Private chef pricing in Memphis
            </h2>
            <ul className="m-0 list-disc space-y-2 pl-5 text-sk-text-muted leading-relaxed">
              <li>
                <strong className="text-sk-navy">Typical range:</strong> $150–$300 per hour for on-site service
              </li>
              <li>
                <strong className="text-sk-navy">Full event packages:</strong> $500–$3,000+ depending on headcount and
                menu complexity
              </li>
              <li>
                <strong className="text-sk-navy">Factors:</strong> guest count, menu complexity, duration, travel, and
                service style (plated vs family-style)
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="m-0 mb-3 text-xl font-bold text-sk-navy" style={{ fontFamily: fontBarlow }}>
              Food truck pricing in Memphis
            </h2>
            <ul className="m-0 list-disc space-y-2 pl-5 text-sk-text-muted leading-relaxed">
              <li>
                <strong className="text-sk-navy">Typical range:</strong> $800–$2,500 per event
              </li>
              <li>
                <strong className="text-sk-navy">Corporate packages:</strong> $1,200–$5,000+ for larger headcounts and
                longer service windows
              </li>
              <li>
                <strong className="text-sk-navy">Factors:</strong> guest count, duration, travel distance, and menu
              </li>
            </ul>
          </section>

          <section className="mb-10 rounded-sk-md border border-sk-gold/30 bg-sk-gold-light/40 p-5">
            <h2 className="m-0 mb-3 text-xl font-bold text-sk-navy" style={{ fontFamily: fontBarlow }}>
              SpiceKrewe&apos;s fee
            </h2>
            <p className="m-0 text-sk-text-muted leading-relaxed">
              We charge <strong className="text-sk-navy">5%</strong> of the booking total. You pay the provider&apos;s
              rate plus 5%. <strong className="text-sk-navy">No hidden fees. No subscription.</strong>
            </p>
          </section>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/concierge"
              className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md px-6 py-2.5 text-sm font-bold text-white no-underline shadow-md"
              style={{ background: primary, fontFamily: fontBarlow }}
            >
              Get a custom quote
            </Link>
            <Link
              to="/talent"
              className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md border border-sk-card-border bg-white px-6 py-2.5 text-sm font-semibold text-spice-purple no-underline hover:bg-sk-purple-light/20"
            >
              Browse chefs &amp; trucks
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
