import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import BriefExplainer from '../components/BriefExplainer';

const DASHBOARD_PATH = '/dashboard/briefs';

export default function HireSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const paidFeatured = Boolean(sessionId?.trim());

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--sk-body-bg)' }}>
      <SEO
        title={paidFeatured ? 'Welcome to the Krewe | SpiceKrewe' : "You're all set | SpiceKrewe"}
        path="/hire/success"
      />
      <Navbar />
      <main style={{ flex: 1, padding: '40px 16px 56px' }}>
        <div style={{ maxWidth: 540, margin: '0 auto 20px', boxSizing: 'border-box' }}>
          <BriefExplainer />
        </div>
        <div
          style={{
            maxWidth: 540,
            margin: '0 auto',
            background: 'var(--sk-surface)',
            borderRadius: 'var(--sk-radius-lg)',
            border: '1px solid var(--sk-card-border)',
            boxShadow: '0 12px 40px rgba(26, 26, 46, 0.08)',
            padding: '36px 28px 32px',
            boxSizing: 'border-box',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'var(--sk-gold-light)',
              border: '2px solid var(--sk-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-hidden
          >
            <CheckCircle2 size={38} color="var(--sk-gold)" strokeWidth={2.25} />
          </div>

          <p
            style={{
              margin: '0 0 10px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--sk-purple)',
            }}
          >
            {paidFeatured ? 'Featured matching' : 'You’re in'}
          </p>

          <h1
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 1.85rem)',
              fontWeight: 700,
              color: 'var(--sk-navy)',
              margin: '0 0 14px',
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
            }}
          >
            Welcome to the Krewe
          </h1>

          <p
            style={{
              margin: '0 0 24px',
              fontSize: 16,
              color: 'var(--sk-text-subtle)',
              lineHeight: 1.65,
              maxWidth: 440,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {paidFeatured ? (
              <>
                Your payment is confirmed and featured placement is active. Our team will prioritize your brief and
                follow up with next steps shortly.
              </>
            ) : (
              <>
                Thank you for trusting SpiceKrewe with your event. We&apos;re matching your request with verified chefs
                and trucks and will be in touch soon.
              </>
            )}
          </p>

          {sessionId ? (
            <p
              style={{
                margin: '0 0 28px',
                fontSize: 12,
                color: 'var(--sk-text-soft)',
                wordBreak: 'break-all',
                lineHeight: 1.45,
              }}
            >
              Checkout reference: <span style={{ fontFamily: 'ui-monospace, monospace' }}>{sessionId}</span>
            </p>
          ) : (
            <div style={{ height: 8 }} />
          )}

          <div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            style={{ marginTop: sessionId ? 0 : 8, alignItems: 'stretch' }}
          >
            <Link
              to={DASHBOARD_PATH}
              className="inline-flex items-center justify-center"
              style={{
                minHeight: 48,
                padding: '14px 22px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 'var(--sk-radius-md)',
                background: 'var(--sk-purple)',
                color: '#fff',
                textDecoration: 'none',
                boxSizing: 'border-box',
                border: '1px solid var(--sk-purple-dark)',
              }}
            >
              View my briefs
            </Link>
            <Link
              to="/talent"
              className="inline-flex items-center justify-center"
              style={{
                minHeight: 48,
                padding: '14px 22px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 'var(--sk-radius-md)',
                background: 'transparent',
                color: 'var(--sk-purple)',
                textDecoration: 'none',
                boxSizing: 'border-box',
                border: '2px solid var(--sk-gold)',
              }}
            >
              Browse chefs &amp; trucks
            </Link>
          </div>

          <p style={{ margin: '24px 0 0', fontSize: 12, color: 'var(--sk-text-soft)', lineHeight: 1.5 }}>
            Client dashboard is in development; &quot;View my briefs&quot; opens a placeholder you can swap for the
            live console at launch.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
