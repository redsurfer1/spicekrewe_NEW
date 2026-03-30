import { Link } from 'react-router-dom';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO, { DEFAULT_OG_IMAGE } from '../../components/SEO';
import { getTalentById, TALENT_FALLBACK } from '../../data/talent';
import { buildNewOrleansHirePageStructuredData } from '../../lib/seo/newOrleansLocalBusinessJsonLd';
import { NEW_ORLEANS_VOICE_SEARCH_FAQ_ITEMS } from '../../lib/seo/newOrleansVoiceFaq';

const TITLE = 'Cajun & Creole private chef hire New Orleans | Spice Krewe';
const DESCRIPTION =
  'Cajun and Creole private chef hire New Orleans and NOLA food product development—SK Verified talent in New Orleans, Louisiana. Match in 48 hours, no agency fees.';
const PATH = '/hire/new-orleans';

const rafaelResult = getTalentById('rafael-cruz', TALENT_FALLBACK);
const rafael = rafaelResult.success ? rafaelResult.data : null;

export default function NewOrleansHirePage() {
  const structuredData = buildNewOrleansHirePageStructuredData(NEW_ORLEANS_VOICE_SEARCH_FAQ_ITEMS);

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
        geoRegion="US-LA"
        geoPlacename="New Orleans, Louisiana"
      />
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-sk-navy sm:text-5xl">
            Hire vetted culinary talent in New Orleans, Louisiana
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-sk-text-muted leading-relaxed">
            Cajun and Creole private chef hire New Orleans, NOLA food product development, and Gulf South brand
            shoots—SK Verified professionals across Greater New Orleans, serving New Orleans, Louisiana and the Gulf
            Coast.
          </p>
          <Link
            to={`/talent?location=${encodeURIComponent('New Orleans')}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md px-8 py-3 text-sm font-bold text-white no-underline shadow-md hover:opacity-95"
            style={{ background: 'var(--sk-purple)' }}
          >
            Browse New Orleans talent
          </Link>
        </div>

        <section className="mx-auto mt-16 max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold text-sk-navy">Local pro spotlight</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {rafael ? (
              <div className="rounded-sk-lg border border-sk-card-border bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sk-gold)' }}>
                  New Orleans, Louisiana
                </p>
                <h3 className="mt-2 text-xl font-bold text-sk-navy">{rafael.name}</h3>
                <p className="text-sm font-medium" style={{ color: 'var(--sk-purple)' }}>
                  {rafael.role}
                </p>
                <p className="mt-2 text-sm text-sk-text-muted leading-relaxed">{rafael.specialty}</p>
                <p className="mt-3 text-sm font-semibold text-sk-navy">{rafael.rate} · SK Verified · Lead Gulf stylist</p>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/talent/rafael-cruz"
                      className="text-sm font-semibold text-spice-purple no-underline hover:underline"
                    >
                      Rafael Cruz — Gulf South food stylist
                    </Link>
                    <Link
                      to={`/hire?talentId=${encodeURIComponent(rafael.id)}`}
                      className="text-sm font-semibold text-sk-navy no-underline hover:underline"
                    >
                      Book Rafael
                    </Link>
                  </div>
                  <Link
                    to="/blog/new-orleans-culinary-talent"
                    className="text-sm font-semibold text-spice-purple no-underline hover:underline"
                  >
                    Read the full New Orleans culinary talent guide →
                  </Link>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col justify-center rounded-sk-lg border border-dashed border-sk-card-border bg-white/80 p-6 text-center">
              <p className="text-sm font-semibold text-sk-navy">More New Orleans talent joining soon</p>
              <p className="mt-2 text-sm text-sk-text-muted">
                Get notified when new Gulf South professionals publish profiles.
              </p>
              <Link
                to="/contact#message"
                className="mt-4 inline-block text-sm font-bold text-spice-purple no-underline hover:underline"
              >
                Contact us
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold text-sk-navy">Popular New Orleans hire requests</h2>
          <ul className="m-0 list-disc space-y-2 pl-5 text-sk-text-muted">
            <li>Cajun and Creole private chef hire New Orleans for home dinners</li>
            <li>NOLA food product development for retail and CPG launches</li>
            <li>Food stylist for hospitality and spirits brand shoots</li>
            <li>Catering chef for festivals and corporate events</li>
          </ul>
        </section>

        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold text-sk-navy">Why SK in New Orleans</h2>
          <ul className="m-0 list-none space-y-3 p-0 text-sk-text-muted">
            <li>
              • We serve hosts and brands across <strong className="text-sk-navy">Louisiana and the Gulf Coast</strong>{' '}
              with transparent briefs—no agency markup on the introduction.
            </li>
            <li>• Lead specialist Rafael Cruz lists $150/hr for SK Verified editorial and e-commerce styling.</li>
            <li>• On-demand culinary R&D for NOLA food product development without long retainers.</li>
            <li>
              • Read{' '}
              <Link
                to="/blog/new-orleans-culinary-talent"
                className="font-semibold text-spice-purple no-underline hover:underline"
              >
                the complete New Orleans culinary talent guide
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="mx-auto mt-14 max-w-3xl" aria-labelledby="new-orleans-voice-faq-heading">
          <h2 id="new-orleans-voice-faq-heading" className="sr-only">
            Frequently asked questions
          </h2>
          <div className="rounded-sk-lg border border-sk-card-border bg-white p-6 shadow-sm sm:p-8">
            <dl className="m-0 space-y-6 p-0">
              {NEW_ORLEANS_VOICE_SEARCH_FAQ_ITEMS.map((item) => (
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
            The New Orleans Flavor Index — our proprietary taste intelligence for the Gulf South — is coming soon.
            Enterprise clients: contact us for early access.
          </p>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
