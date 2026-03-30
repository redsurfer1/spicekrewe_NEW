import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import Navbar from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

const MEMPHIS_FLAVOR_BLOG = '/blog/memphis-culinary-talent';

export default function MatchConfirmed() {
  const [params] = useSearchParams();
  const error = params.get('error');

  const hasError = Boolean(error);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--sk-body-bg)' }}>
      <SEO
        title={hasError ? 'Feedback | Spice Krewe' : 'Thank you | Spice Krewe'}
        path="/hire/match-confirmed"
      />
      <Navbar />
      <main className="flex-1 px-4 py-10 sm:py-14" style={{ paddingBottom: '56px' }}>
        <div
          className="mx-auto max-w-[540px] text-center"
          style={{
            background: 'var(--sk-surface)',
            borderRadius: 'var(--sk-radius-lg)',
            border: '1px solid var(--sk-card-border)',
            boxShadow: '0 12px 40px rgba(26, 26, 46, 0.08)',
            padding: 'clamp(28px, 5vw, 40px) clamp(22px, 4vw, 36px)',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full"
            style={{
              background: hasError ? 'rgba(107, 90, 136, 0.12)' : 'var(--sk-gold-light)',
              border: hasError ? '2px solid var(--sk-card-border)' : '2px solid var(--sk-gold)',
            }}
            aria-hidden
          >
            {hasError ? (
              <Sparkles className="h-9 w-9" style={{ color: 'var(--sk-purple)' }} strokeWidth={2} />
            ) : (
              <CheckCircle2 className="h-9 w-9" style={{ color: 'var(--sk-gold)' }} strokeWidth={2.25} />
            )}
          </div>

          <p
            className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: 'var(--sk-purple)' }}
          >
            {hasError ? 'Something went wrong' : 'Match feedback'}
          </p>

          <h1
            className="mb-4 text-[clamp(1.5rem,4vw,1.85rem)] font-bold leading-tight tracking-tight"
            style={{ color: 'var(--sk-navy)' }}
          >
            {hasError ? 'We could not save your feedback' : 'Thank you for your feedback'}
          </h1>

          {hasError ? (
            <p className="mb-8 text-base leading-relaxed" style={{ color: 'var(--sk-text-muted)' }}>
              The link may have expired or was incomplete. If you need help, reach out through{' '}
              <Link to="/contact" className="font-semibold underline decoration-spice-purple/40 underline-offset-2" style={{ color: 'var(--sk-purple)' }}>
                contact
              </Link>
              .
            </p>
          ) : (
            <p className="mb-10 text-base leading-relaxed" style={{ color: 'var(--sk-text-muted)' }}>
              Thank you for your feedback. Your input helps our AI matchmaker become smarter for the entire
              Memphis culinary community.
            </p>
          )}

          {!hasError ? (
            <div
              className="rounded-sk-md border px-5 py-4 text-left text-sm leading-relaxed"
              style={{
                borderColor: 'var(--sk-card-border)',
                background: 'rgba(107, 90, 136, 0.06)',
              }}
            >
              <p className="mb-3 font-semibold" style={{ color: 'var(--sk-navy)' }}>
                Interested in more culinary data?
              </p>
              <p className="mb-0" style={{ color: 'var(--sk-text-muted)' }}>
                Check out the{' '}
                <Link
                  to={MEMPHIS_FLAVOR_BLOG}
                  className="font-semibold underline decoration-spice-purple/40 underline-offset-2"
                  style={{ color: 'var(--sk-purple)' }}
                >
                  Memphis Flavor Index teaser
                </Link>
                .
              </p>
            </div>
          ) : null}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              style={{ background: 'var(--sk-purple)' }}
            >
              Back to home
            </Link>
            {!hasError ? (
              <Link
                to={MEMPHIS_FLAVOR_BLOG}
                className="inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold transition hover:bg-black/[0.02]"
                style={{ borderColor: 'var(--sk-card-border)', color: 'var(--sk-navy)' }}
              >
                Memphis Flavor Index
              </Link>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
