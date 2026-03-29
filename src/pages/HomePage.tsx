import { Link } from 'react-router-dom';
import Navbar from '../components/Navigation';
import About from '../components/About';
import Events from '../components/Events';
import KreweMap from '../components/KreweMap';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import B2BBanner from '../components/B2BBanner';
import ProjectSpotlight from '../components/ProjectSpotlight';
import SEO from '../components/SEO';
import { useApp } from '../contexts/AppContext';

export default function HomePage() {
  const { showMap } = useApp();

  return (
    <div className="min-h-screen bg-sk-body-bg">
      <SEO />
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
          Find the culinary expert your project deserves
        </h1>
        <p
          style={{
            fontSize: 15,
            color: '#b99ee8',
            maxWidth: 480,
            margin: '0 auto 28px',
            lineHeight: 1.7,
          }}
        >
          Connect with vetted chefs, recipe developers, food stylists, and flavor consultants —
          credentialed by Spice Krewe&apos;s culinary standard.
        </p>
        <div style={{ display: 'flex', maxWidth: 560, margin: '0 auto 20px', gap: 10 }}>
          <input
            type="search"
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
      <Contact />
      <B2BBanner />
      <Footer />
    </div>
  );
}
