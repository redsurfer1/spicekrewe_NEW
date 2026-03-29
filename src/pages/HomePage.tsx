import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation';
import About from '../components/About';
import Events from '../components/Events';
import KreweMap from '../components/KreweMap';
import Footer from '../components/Footer';
import B2BBanner from '../components/B2BBanner';
import ProjectSpotlight from '../components/ProjectSpotlight';
import TalentCard from '../components/TalentCard';
import SEO from '../components/SEO';
import { TALENT_FALLBACK } from '../data/talent';
import { useApp } from '../contexts/AppContext';

export default function HomePage() {
  const { showMap } = useApp();

  return (
    <div className="min-h-screen bg-sk-body-bg">
      <SEO
        description="Culinary operating system for food brands and restaurant groups—vetted R&D talent, briefs, and secure collaboration."
        ogDescription="Culinary operating system for food brands and restaurant groups—vetted R&D talent, briefs, and secure collaboration."
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
          }}
        >
          SPICE KREWE VERIFIED NETWORK
        </div>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: '#fff',
            lineHeight: 1.2,
            margin: '0 auto 20px',
            maxWidth: 720,
          }}
        >
          Hire vetted{' '}
          <span className="text-sk-purple-light">culinary professionals</span>
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
          Access on-demand culinary R&D and vetted professionals for food brands and restaurant
          groups.
        </p>
        <div style={{ display: 'flex', maxWidth: 560, margin: '0 auto 20px', gap: 10 }}>
          <label htmlFor="home-hero-search" className="sr-only">
            Search talent by role or specialty
          </label>
          <input
            id="home-hero-search"
            type="search"
            name="q"
            placeholder="Recipe developer, food stylist, private chef..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(179, 153, 232, 0.35)',
              borderRadius: 10,
              padding: '12px 18px',
              fontSize: 14,
              color: '#fff',
              outline: 'none',
            }}
          />
          <Link
            to="/talent"
            style={{
              background: '#3275bd',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 22px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Search
          </Link>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 28,
          }}
        >
          {[
            'Recipe development',
            'Food styling',
            'Flavor consulting',
            'Private chef',
            'Culinary content',
            'Menu design',
          ].map((cat) => (
            <Link
              key={cat}
              to="/talent"
              style={{
                fontSize: 12,
                padding: '6px 14px',
                borderRadius: 9999,
                border: '1px solid rgba(179, 153, 232, 0.35)',
                color: '#b99ee8',
                background: 'rgba(77, 47, 145, 0.25)',
                textDecoration: 'none',
              }}
            >
              {cat}
            </Link>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            fontSize: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {['25+ verified professionals', 'SK credentialed', 'Secure payments', 'Satisfaction guaranteed'].map(
            (item, i) => (
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
            ),
          )}
        </div>
      </section>

      <section className="bg-[var(--sk-body-bg)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Featured <span className="text-spice-purple">culinary talent</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-spice-purple to-spice-blue mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TALENT_FALLBACK.slice(0, 4).map((professional) => (
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
              <h3 className="m-0 mb-2 text-lg font-bold text-sk-navy">Post your brief</h3>
              <p className="m-0 text-[15px] leading-relaxed text-sk-text-muted flex-1">
                Share scope, constraints, and success criteria—like defining the gig, with room for enterprise nuance when
                you need it.
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
              <h3 className="m-0 mb-2 text-lg font-bold text-sk-navy">Get matched</h3>
              <p className="m-0 text-[15px] leading-relaxed text-sk-text-muted flex-1">
                We route credentialed Krewe talent to your brief so you review fit, credentials, and rates before work
                begins.
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
              <h3 className="m-0 mb-2 text-lg font-bold text-sk-navy">Work with the Krewe</h3>
              <p className="m-0 text-[15px] leading-relaxed text-sk-text-muted flex-1">
                Collaborate through milestones, protect proprietary detail with our privacy workflow, and pay with clear
                commercial threads.
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
                Visit us at one of our locations. Click a marker for details.
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
      <B2BBanner />
      <Footer />
    </div>
  );
}
