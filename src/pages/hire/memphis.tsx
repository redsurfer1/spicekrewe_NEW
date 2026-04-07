import { Link } from 'react-router-dom';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO, { DEFAULT_OG_IMAGE } from '../../components/SEO';
import { getTalentById, TALENT_FALLBACK } from '../../data/talent';
import { buildCityHirePageStructuredData } from '../../lib/seo/cityLocalBusinessJsonLd';
import { buildCityVoiceFaqItems, memphisProviderMix } from '../../lib/seo/cityVoiceFaq';
import { useCity } from '../../lib/city/useCity';

const PATH = '/hire/memphis';

const rafaelResult = getTalentById('rafael-cruz', TALENT_FALLBACK);
const rafael = rafaelResult.success ? rafaelResult.data : null;

export default function MemphisHirePage() {
  const { cityDisplayName, cityStateCode } = useCity();

  const title = `Vetted private chefs & food trucks in ${cityDisplayName}, ${cityStateCode} | Spice Krewe`;
  const description = `Book a private chef or food truck in ${cityDisplayName}, ${cityStateCode}. SpiceKrewe connects you with verified culinary professionals for private events, corporate gatherings, and celebrations.`;

  const faq = buildCityVoiceFaqItems(cityDisplayName);
  const structuredData = buildCityHirePageStructuredData(
    {
      cityName: cityDisplayName,
      regionCode: cityStateCode,
      country: 'US',
      hirePath: PATH,
      description: `SpiceKrewe — private chef and food truck booking platform in ${cityDisplayName}. AI-powered concierge. Verified providers.`,
      providerTypes: memphisProviderMix(),
      mapUrl: `https://www.google.com/maps/place/${encodeURIComponent(`${cityDisplayName}, ${cityStateCode}`)}`,
    },
    faq,
  );

  return (
    <div className="flex min-h-screen flex-col bg-sk-body-bg">
      <SEO
        title={title}
        description={description}
        path={PATH}
        ogTitle={title}
        ogDescription={description}
        image={DEFAULT_OG_IMAGE}
        structuredData={structuredData}
        geoRegion={cityStateCode.length === 2 ? `US-${cityStateCode}` : 'US-TN'}
        geoPlacename={`${cityDisplayName}, ${cityStateCode}`}
      />
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-sk-navy sm:text-5xl">
            Book a private chef or food truck in {cityDisplayName}, {cityStateCode}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-sk-text-muted leading-relaxed">
            The best way to book verified private chefs and food trucks for events in {cityDisplayName} — from intimate
            dinners to corporate and outdoor gatherings.
          </p>
          <Link
            to={`/talent?location=${encodeURIComponent(cityDisplayName)}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md px-8 py-3 text-sm font-bold text-white no-underline shadow-md hover:opacity-95"
            style={{ background: 'var(--sk-purple)' }}
          >
            Browse {cityDisplayName} talent
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
                      Rafael Cruz — Memphis food truck
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
            <li>Private chef for a Midtown dinner party</li>
            <li>Food truck for a corporate event in the medical district</li>
            <li>Private chef for a holiday celebration in East Memphis</li>
            <li>Food truck for an outdoor event at Shelby Farms</li>
            <li>Private chef specializing in Southern and BBQ cuisine</li>
          </ul>
        </section>

        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold text-sk-navy">Why SK in Memphis</h2>
          <ul className="m-0 list-none space-y-3 p-0 text-sk-text-muted">
            <li>
              • We serve buyers and hosts across <strong className="text-sk-navy">Tennessee and Mississippi</strong>{' '}
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
              {faq.map((item) => (
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
            The Memphis Event Planning — our proprietary taste intelligence for the Mid-South market — is coming soon.
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
