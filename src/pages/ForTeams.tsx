import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const primary = '#4d2f91';
const fontBarlow = '"Barlow Condensed", system-ui, sans-serif';

export default function ForTeams() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--sk-body-bg)' }}>
      <SEO
        title="Corporate events | SpiceKrewe"
        description="Book private chefs and food trucks for corporate events in Memphis — team lunches, appreciation events, and holiday parties."
        path="/for-teams"
        ogTitle="Corporate events | SpiceKrewe"
        ogDescription="Book private chefs and food trucks for corporate events in Memphis."
      />
      <Navbar />

      <section
        style={{
          background: 'var(--sk-navy)',
          color: '#fff',
          padding: '64px 24px 72px',
        }}
      >
        <div className="mx-auto max-w-[900px] text-center">
          <p
            style={{
              margin: '0 0 12px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--sk-gold)',
            }}
          >
            Teams &amp; companies
          </p>
          <h1
            style={{
              margin: '0 0 16px',
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              fontFamily: fontBarlow,
            }}
          >
            Book food for your team events
          </h1>
          <p
            style={{
              margin: '0 auto 24px',
              fontSize: 17,
              lineHeight: 1.65,
              color: 'var(--sk-fg-on-dark)',
              maxWidth: 640,
            }}
          >
            SpiceKrewe makes it easy to book private chefs and food trucks for corporate events in Memphis. Quarterly
            team lunches, appreciation events, holiday parties — we handle the food.
          </p>
          <Link
            to="/concierge"
            className="inline-flex min-h-[48px] items-center justify-center rounded-sk-md px-8 text-base font-bold text-white no-underline shadow-lg"
            style={{ background: primary, fontFamily: fontBarlow }}
          >
            Plan a corporate event
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-4 py-14 sm:px-6">
        <h2 className="m-0 mb-6 text-center text-2xl font-bold text-sk-navy" style={{ fontFamily: fontBarlow }}>
          Why teams use SpiceKrewe
        </h2>
        <ul className="m-0 list-none space-y-4 p-0 text-[15px] leading-relaxed text-sk-text-muted">
          <li>✓ Verified chefs and food trucks</li>
          <li>✓ Scales from 10 to 200+ people</li>
          <li>✓ Single invoice, secure payment</li>
          <li>✓ AI concierge handles vendor selection</li>
        </ul>
      </section>

      <Footer />
    </div>
  );
}
