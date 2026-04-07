import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation';
import About from '../components/About';
import Events from '../components/Events';
import KreweMap from '../components/KreweMap';
import Footer from '../components/Footer';
import ProjectSpotlight from '../components/ProjectSpotlight';
import TalentCard from '../components/TalentCard';
import SEO from '../components/SEO';
import { TALENT_FALLBACK } from '../data/talent';
import { useApp } from '../contexts/AppContext';

const fontBarlow = '"Barlow Condensed", system-ui, sans-serif';

function isBookableProvider(row: (typeof TALENT_FALLBACK)[number]) {
  return row.providerType === 'private_chef' || row.providerType === 'food_truck';
}

export default function HomePage() {
  const { showMap } = useApp();
  const featured = TALENT_FALLBACK.filter(isBookableProvider).slice(0, 4);

  return (
    <div className="min-h-screen bg-sk-body-bg">
      <SEO
        title="SpiceKrewe — Book a Private Chef or Food Truck in Memphis"
        description="SpiceKrewe connects Memphis with the city's best private chefs and food trucks. Book for your next event — AI concierge, verified providers, secure payment."
        ogTitle="SpiceKrewe — Book a Private Chef or Food Truck in Memphis"
        ogDescription="SpiceKrewe connects Memphis with the city's best private chefs and food trucks. Book for your next event — AI concierge, verified providers, secure payment."
      />
      <Navbar />
      <section style={{ background: '#1a1a2e', padding: '60px 32px 48px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 600,
            color: '#e6a800',
            letterSpacing: '0.08em',
            background: 'rgba(230, 168, 0, 0.14)',
            padding: '6px 16px',
            borderRadius: 9999,
            marginBottom: 20,
            border: '1px solid rgba(230, 168, 0, 0.35)',
            fontFamily: fontBarlow,
          }}
        >
          MEMPHIS, TN · PRIVATE CHEFS & FOOD TRUCKS
        </div>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: '#fff',
            lineHeight: 1.2,
            margin: '0 auto 20px',
            maxWidth: 720,
            fontFamily: fontBarlow,
          }}
        >
          Book the perfect chef
          <br />
          for your next event
        </h1>
        <p
          style={{
            fontSize: 15,
            color: '#b99ee8',
            maxWidth: 560,
            margin: '0 auto 28px',
            lineHeight: 1.7,
          }}
        >
          SpiceKrewe connects Memphis with the city&apos;s best private chefs and food trucks. Tell us about your
          event — we&apos;ll handle the rest.
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <Link
            to="/concierge"
            style={{
              background: '#4d2f91',
              color: '#fff',
              borderRadius: 10,
              padding: '14px 28px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              fontFamily: fontBarlow,
              letterSpacing: '0.02em',
            }}
          >
            Plan my event
          </Link>
          <Link
            to="/talent"
            style={{
              color: '#b99ee8',
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'underline',
              textUnderlineOffset: 4,
            }}
          >
            Browse chefs &amp; trucks
          </Link>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            maxWidth: 920,
            margin: '0 auto 24px',
            textAlign: 'left',
          }}
        >
          <article
            style={{
              border: '1px solid rgba(179, 153, 232, 0.35)',
              borderRadius: 12,
              padding: '20px 20px 22px',
              background: 'rgba(77, 47, 145, 0.2)',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden>
              👨‍🍳
            </div>
            <h2 style={{ margin: '0 0 8px', color: '#fff', fontSize: 20, fontFamily: fontBarlow, fontWeight: 800 }}>
              Private Chef
            </h2>
            <p style={{ margin: '0 0 16px', color: '#b99ee8', fontSize: 14, lineHeight: 1.6 }}>
              Intimate dinners, special occasions, and celebrations. 1–30 guests.
            </p>
            <Link
              to="/talent?type=private_chef"
              style={{ color: '#3275bd', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
            >
              Find a chef →
            </Link>
          </article>
          <article
            style={{
              border: '1px solid rgba(179, 153, 232, 0.35)',
              borderRadius: 12,
              padding: '20px 20px 22px',
              background: 'rgba(77, 47, 145, 0.2)',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden>
              🚚
            </div>
            <h2 style={{ margin: '0 0 8px', color: '#fff', fontSize: 20, fontFamily: fontBarlow, fontWeight: 800 }}>
              Food Truck
            </h2>
            <p style={{ margin: '0 0 16px', color: '#b99ee8', fontSize: 14, lineHeight: 1.6 }}>
              Corporate events, parties, and outdoor gatherings. 20–200+ guests.
            </p>
            <Link
              to="/talent?type=food_truck"
              style={{ color: '#3275bd', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
            >
              Find a truck →
            </Link>
          </article>
        </div>
        <p style={{ margin: '0 auto 8px', maxWidth: 560, color: '#8a7aaa', fontSize: 14, lineHeight: 1.5 }}>
          Not sure? Let our AI concierge help.{' '}
          <Link to="/concierge" style={{ color: '#3275bd', fontWeight: 600 }}>
            Try the concierge
          </Link>
        </p>
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            fontSize: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: 20,
          }}
        >
          {['25+ verified Memphis chefs & trucks', 'Secure payments', 'Satisfaction guaranteed'].map((item, i) => (
            <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && (
                <span
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    background: '#4d2f91',
                    display: 'inline-block',
                  }}
                />
              )}
              <span style={{ color: '#8a7aaa' }}>{item}</span>
            </span>
          ))}
        </div>
      </section>

      <section className="bg-[var(--sk-body-bg)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Featured <span className="text-spice-purple">chefs &amp; trucks</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-spice-purple to-spice-blue mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((professional) => (
              <TalentCard key={professional.id} professional={professional} appendTalentIdQuery />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--sk-surface)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-4xl sm:text-5xl font-bold text-sk-navy mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <article className="flex flex-col rounded-sk-lg border border-sk-card-border bg-white p-6 sm:p-7 h-full">
              <span
                className="mb-4 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white"
                style={{ background: 'var(--sk-purple)' }}
                aria-hidden
              >
                01
              </span>
              <h3 className="m-0 mb-2 text-lg font-bold text-sk-navy">Tell us about your event</h3>
              <p className="m-0 text-[15px] leading-relaxed text-sk-text-muted flex-1">
                Describe your event, guest count, and budget in minutes.
              </p>
            </article>
            <article className="flex flex-col rounded-sk-lg border border-sk-card-border bg-white p-6 sm:p-7 h-full">
              <span
                className="mb-4 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white"
                style={{ background: 'var(--sk-blue)' }}
                aria-hidden
              >
                02
              </span>
              <h3 className="m-0 mb-2 text-lg font-bold text-sk-navy">We find the perfect match</h3>
              <p className="m-0 text-[15px] leading-relaxed text-sk-text-muted flex-1">
                Our AI concierge recommends the best chefs and trucks for your event.
              </p>
            </article>
            <article className="flex flex-col rounded-sk-lg border border-sk-card-border bg-white p-6 sm:p-7 h-full">
              <span
                className="mb-4 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-extrabold"
                style={{ background: 'var(--sk-gold)', color: 'var(--sk-navy)' }}
                aria-hidden
              >
                03
              </span>
              <h3 className="m-0 mb-2 text-lg font-bold text-sk-navy">Book with confidence</h3>
              <p className="m-0 text-[15px] leading-relaxed text-sk-text-muted flex-1">
                Every provider is SpiceKrewe verified. Secure payment. Satisfaction guaranteed.
              </p>
            </article>
          </div>
        </div>
      </section>

      <ProjectSpotlight />
      <About />
      <Events />
      {showMap && (
        <section id="find-us" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Find <span className="text-spice-purple">Spice Krewe</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-spice-purple to-spice-blue mx-auto mb-6" />
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Memphis-area providers and Krewe touchpoints — click a marker for details.
              </p>
            </div>
            <KreweMap />
          </div>
        </section>
      )}
      <section className="py-16 sm:py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Have a question?</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Send us a message—we will get back to you as soon as we can.
          </p>
          <Link
            to="/contact#message"
            className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md bg-spice-purple px-8 py-3 text-[15px] font-semibold text-white no-underline shadow-md shadow-spice-purple/30 hover:bg-spice-blue transition-colors"
          >
            Contact us
          </Link>
        </div>
      </section>
      <section
        className="relative z-[1] px-6 py-12 text-white"
        style={{ backgroundColor: '#4d2f91' }}
        aria-labelledby="sk-corporate-events-heading"
      >
        <div className="mx-auto flex max-w-[960px] flex-col items-start gap-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-sk-gold">Corporate &amp; teams</p>
          <h2 id="sk-corporate-events-heading" className="m-0 max-w-[640px] text-xl font-bold leading-snug sm:text-2xl">
            Hosting a corporate event in Memphis?
          </h2>
          <p className="m-0 max-w-[560px] text-base leading-relaxed text-white/90">
            Food trucks for all-hands, private chefs for client dinners — tell us headcount and budget and we&apos;ll
            match you with verified providers.
          </p>
          <Link
            to="/concierge"
            className="mt-2 inline-flex min-h-[44px] items-center rounded-sk-md bg-sk-gold px-[22px] py-3 text-sm font-bold text-sk-navy no-underline"
            style={{ fontFamily: fontBarlow }}
          >
            Plan with the concierge
            <span aria-hidden className="ml-2">
              →
            </span>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
