import { Link } from 'react-router-dom';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO, { DEFAULT_OG_IMAGE } from '../../components/SEO';
import { getTalentById, TALENT_FALLBACK } from '../../data/talent';
import { buildNashvilleHirePageStructuredData } from '../../lib/seo/nashvilleLocalBusinessJsonLd';
import { NASHVILLE_VOICE_SEARCH_FAQ_ITEMS } from '../../lib/seo/nashvilleVoiceFaq';

const TITLE = 'Vetted chefs & food trucks in Nashville, TN | Spice Krewe';
const DESCRIPTION =
  'Book a private chef or food truck in Nashville, TN. SpiceKrewe connects you with verified culinary professionals for private events, corporate gatherings, and celebrations.';
const PATH = '/hire/nashville';

const marcusResult = getTalentById('marcus-johnson', TALENT_FALLBACK);
const aishaResult = getTalentById('aisha-thompson', TALENT_FALLBACK);
const marcus = marcusResult.success ? marcusResult.data : null;
const aisha = aishaResult.success ? aishaResult.data : null;

function TalentSpotlightCard({
  row,
  localityLabel,
}: {
  row: NonNullable<typeof marcus>;
  localityLabel: string;
}) {
  return (
    <div className="rounded-sk-lg border border-sk-card-border bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sk-gold)' }}>
        {localityLabel}
      </p>
      <h3 className="mt-2 text-xl font-bold text-sk-navy">{row.name}</h3>
      <p className="text-sm font-medium" style={{ color: 'var(--sk-purple)' }}>
        {row.role}
      </p>
      <p className="mt-2 text-sm text-sk-text-muted leading-relaxed">{row.specialty}</p>
      <p className="mt-3 text-sm font-semibold text-sk-navy">{row.rate} · SK Verified</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link to={`/talent/${row.id}`} className="text-sm font-semibold text-spice-purple no-underline hover:underline">
          View profile
        </Link>
        <Link
          to={`/hire?talentId=${encodeURIComponent(row.id)}`}
          className="text-sm font-semibold text-sk-navy no-underline hover:underline"
        >
          Book {row.name.split(' ')[0]}
        </Link>
      </div>
    </div>
  );
}

export default function NashvilleHirePage() {
  const structuredData = buildNashvilleHirePageStructuredData(NASHVILLE_VOICE_SEARCH_FAQ_ITEMS);

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
        geoPlacename="Nashville, Tennessee"
      />
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-sk-navy sm:text-5xl">
            Hire vetted culinary talent in Nashville, Tennessee
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-sk-text-muted leading-relaxed">
            Private chef and food truck bookings for Music Row events, bachelorette weekends, and corporate gatherings—SK
            Verified professionals across the Greater Nashville area, serving Nashville, Tennessee and Middle Tennessee.
          </p>
          <Link
            to="/talent?location=Nashville"
            className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md px-8 py-3 text-sm font-bold text-white no-underline shadow-md hover:opacity-95"
            style={{ background: 'var(--sk-purple)' }}
          >
            Browse Nashville talent
          </Link>
        </div>

        <section className="mx-auto mt-16 max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold text-sk-navy">Local pro spotlight</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {marcus ? <TalentSpotlightCard row={marcus} localityLabel="Nashville, Tennessee" /> : null}
            {aisha ? <TalentSpotlightCard row={aisha} localityLabel="Nashville, Tennessee" /> : null}
            <div className="flex flex-col justify-center rounded-sk-lg border border-dashed border-sk-card-border bg-white/80 p-6 text-center">
              <p className="text-sm font-semibold text-sk-navy">More Nashville talent joining soon</p>
              <p className="mt-2 text-sm text-sk-text-muted">Get notified when new Middle Tennessee pros publish profiles.</p>
              <Link
                to="/contact#message"
                className="mt-4 inline-block text-sm font-bold text-spice-purple no-underline hover:underline"
              >
                Contact us
              </Link>
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-sk-text-muted">
            <Link
              to="/blog/nashville-culinary-talent"
              className="font-semibold text-spice-purple no-underline hover:underline"
            >
              Read the full Nashville culinary talent guide →
            </Link>
          </p>
        </section>

        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold text-sk-navy">Popular Nashville hire requests</h2>
          <ul className="m-0 list-disc space-y-2 pl-5 text-sk-text-muted">
            <li>Private chef for a bachelorette dinner in East Nashville</li>
            <li>Food truck for a corporate event near Music Row</li>
            <li>Private chef specializing in hot chicken and Southern cuisine</li>
            <li>Food truck for an outdoor wedding reception in Franklin</li>
            <li>Private chef for a team dinner during CMA Fest week</li>
          </ul>
        </section>

        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold text-sk-navy">Why SK in Nashville</h2>
          <ul className="m-0 list-none space-y-3 p-0 text-sk-text-muted">
            <li>
              • We support hosts and hosts across <strong className="text-sk-navy">Tennessee and Kentucky</strong> with
              the same transparent brief flow—no agency markup on the request itself.
            </li>
            <li>• SK Verified anchors include Marcus Johnson at $175/hr and Aisha Thompson at $165/hr for Nashville-market bookings.</li>
            <li>• On-demand event catering without retainers for corporate teams and private celebrations.</li>
            <li>
              • Planning a longer read? Open{' '}
              <Link
                to="/blog/nashville-culinary-talent"
                className="font-semibold text-spice-purple no-underline hover:underline"
              >
                the complete Nashville culinary talent guide
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="mx-auto mt-14 max-w-3xl" aria-labelledby="nashville-voice-faq-heading">
          <h2 id="nashville-voice-faq-heading" className="sr-only">
            Frequently asked questions
          </h2>
          <div className="rounded-sk-lg border border-sk-card-border bg-white p-6 shadow-sm sm:p-8">
            <dl className="m-0 space-y-6 p-0">
              {NASHVILLE_VOICE_SEARCH_FAQ_ITEMS.map((item) => (
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
            The Nashville Event Planning — our proprietary taste intelligence for Middle Tennessee — is coming soon.
            Enterprise clients: contact us for early access.
          </p>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
