import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const LABELS: Record<string, string> = {
  '/how-it-works': 'How it works',
  '/dashboard/briefs': 'Your briefs',
};

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const label = LABELS[pathname] ?? 'Spice Krewe';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--sk-body-bg)' }}>
      <SEO title={`${label} – Spice Krewe`} path={pathname} />
      <Navbar />
      <main
        style={{
          flex: 1,
          padding: '64px 32px',
          textAlign: 'center',
          background: 'var(--sk-body-bg)',
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: 'var(--sk-navy)',
            marginBottom: 12,
          }}
        >
          {label}
        </h1>
        <p
          style={{
            color: 'var(--sk-text-subtle)',
            maxWidth: 420,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          This page is coming soon. We&apos;re building the full experience—check back shortly.
        </p>
      </main>
      <Footer />
    </div>
  );
}
