import { Link } from 'react-router-dom';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO, { DEFAULT_OG_IMAGE } from '../../components/SEO';
import { getTalentById, TALENT_FALLBACK } from '../../data/talent';
import { buildMemphisHirePageStructuredData } from '../../lib/seo/memphisLocalBusinessJsonLd';
import { MEMPHIS_VOICE_SEARCH_FAQ_ITEMS } from '../../lib/seo/memphisVoiceFaq';

const TITLE = 'Vetted private chefs & food stylists in Memphis, TN | Spice Krewe';
const DESCRIPTION =
  'Find and hire SK Verified private chefs, food stylists, and culinary consultants in Memphis, Tennessee. Post a brief, get matched in 48 hours. No agency fees.';
const PATH = '/hire/memphis';

const rafaelResult = getTalentById('rafael-cruz', TALENT_FALLBACK);
const rafael = rafaelResult.success ? rafaelResult.data : null;

export default function MemphisHirePage() {
  const structuredData = buildMemphisHirePageStructuredData(MEMPHIS_VOICE_SEARCH_FAQ_ITEMS);

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
        geoRegion="US-TN"
        geoPlacename="Memphis, Tennessee"
      />
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-sk-navy sm:text-5xl">
            Hire vetted culinary talent in Memphis, Tennessee
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-sk-text-muted leading-relaxed">
            Private chefs, recipe developers, and food stylists for hosts and brands across the Greater Memphis area — SK
            Verified professionals serving Memphis, Tennessee and the Mid-South.
          </p>
          <Link
            to="/talent?location=Memphis"
            className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md px-8 py-3 text-sm font-bold text-white no-underline shadow-md hover:opacity-95"
            style={{ background: 'var(--sk-purple)' }}
          >
            Browse Memphis talent
          </Link>
        </div>

        <section className="mx-auto mt-16 max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold text-sk-navy">Local pro spotlight</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {rafael ? (
              <div className="rounded-sk-lg border border-sk-card-border bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sk-gold)' }}>
                  Memphis, Tennessee
                </p>
                <h3 className="mt-2 text-xl font-bold text-sk-navy">{rafael.name}</h3>
                <p className="text-sm font-medium" style={{ color: 'var(--sk-purple)' }}>
                  {rafael.role}
                </p>
                <p className="mt-2 text-sm text-sk-text-muted leading-relaxed">{rafael.specialty}</p>
                <p className="mt-3 text-sm font-semibold text-sk-navy">{rafael.rate} · SK Verified</p>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/talent/rafael-cruz"
                      className="text-sm font-semibold text-spice-purple no-underline hover:underline"
                    >
                      Rafael Cruz — Memphis food stylist
                    </Link>
                    <Link
                      to={`/hire?talentId=${encodeURIComponent(rafael.id)}`}
                      className="text-sm font-semibold text-sk-navy no-underline hover:underline"
                    >
                      Book Rafael
                    </Link>
                  </div>
                  <Link
                    to="/blog/memphis-culinary-talent"
                    className="text-sm font-semibold text-spice-purple no-underline hover:underline"
                  >
                    Read the full Memphis culinary talent guide →
                  </Link>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col justify-center rounded-sk-lg border border-dashed border-sk-card-border bg-white/80 p-6 text-center">
              <p className="text-sm font-semibold text-sk-navy">More Memphis talent joining soon</p>
              <p className="mt-2 text-sm text-sk-text-muted">
                Get notified when new Mid-South professionals publish profiles.
              </p>
              <Link
                to="/contact?source=flavor-index-early-access#message"
                className="mt-4 inline-block text-sm font-bold text-spice-purple no-underline hover:underline"
              >
                Contact us
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold text-sk-navy">Popular Memphis hire requests</h2>
          <ul className="m-0 list-disc space-y-2 pl-5 text-sk-text-muted">
            <li>Private chef for dinner party</li>
            <li>Creole &amp; Cajun cuisine specialist</li>
            <li>Food stylist for local restaurant photography</li>
            <li>Catering chef for corporate events</li>
          </ul>
        </section>

        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold text-sk-navy">Why SK in Memphis</h2>
          <ul className="m-0 list-none space-y-3 p-0 text-sk-text-muted">
            <li>
              • We serve buyers and brands across <strong className="text-sk-navy">Tennessee and Mississippi</strong>{' '}
              with the same transparent brief flow—no agency markup on the request itself.
            </li>
            <li>• Local professionals with vetted credentials—not anonymous gig listings.</li>
            <li>• Creole &amp; Southern cuisine depth for hospitality-heavy markets.</li>
            <li>
              • Pricing context:{' '}
              <Link to="/blog/private-chef-cost" className="font-semibold text-spice-purple no-underline hover:underline">
                private chef cost guide
              </Link>
              .
            </li>
          </ul>
          <p className="mt-6 text-sm text-sk-text-muted leading-relaxed">
            Planning a longer read? Open{' '}
            <Link to="/blog/memphis-culinary-talent" className="font-semibold text-spice-purple no-underline hover:underline">
              the complete Memphis culinary talent guide
            </Link>
            .
          </p>
        </section>

        <section className="mx-auto mt-14 max-w-3xl" aria-labelledby="memphis-voice-faq-heading">
          <h2 id="memphis-voice-faq-heading" className="sr-only">
            Frequently asked questions
          </h2>
          <div className="rounded-sk-lg border border-sk-card-border bg-white p-6 shadow-sm sm:p-8">
            <dl className="m-0 space-y-6 p-0">
              {MEMPHIS_VOICE_SEARCH_FAQ_ITEMS.map((item) => (
                <div key={item.question}>
                  <dt className="m-0 text-sm font-bold text-sk-navy">{item.question}</dt>
                  <dd className="m-0 mt-2 text-sm leading-relaxed text-sk-text-muted">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <aside
          className="sk-flavor-index-teaser mx-auto mt-12 max-w-3xl rounded-sk-lg border p-6"
          style={{ borderColor: 'var(--sk-gold)', background: 'var(--sk-gold-light)' }}
        >
          <p className="m-0 text-sm font-semibold leading-relaxed" style={{ color: 'var(--sk-navy)' }}>
            The Memphis Flavor Index — our proprietary taste intelligence for the Mid-South market — is coming soon.
            Enterprise clients:{' '}
            <Link
              to="/contact?source=flavor-index-early-access#message"
              className="text-spice-purple underline-offset-2 hover:underline"
            >
              contact us for early access
            </Link>
            .
          </p>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
