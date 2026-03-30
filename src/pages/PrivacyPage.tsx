import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { PRIVACY_LAST_UPDATED, PRIVACY_SECTIONS } from '../content/legal/complianceCopy';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-sk-body-bg">
      <SEO title="Privacy Policy – Spice Krewe" path="/privacy" />
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-sk-navy mb-2">Privacy Policy</h1>
        <p className="text-sm text-sk-text-subtle mb-8">Last updated: {PRIVACY_LAST_UPDATED}</p>

        <div className="max-w-none text-sk-text-muted space-y-6 leading-relaxed">
          {PRIVACY_SECTIONS.map((s) => (
            <section key={s.id}>
              <h2 className="text-lg font-semibold text-sk-navy">{s.title}</h2>
              {s.id === 'contact' ? (
                <p className="mt-2">
                  Questions:{' '}
                  <a href="mailto:hello@spicekrewe.com" className="text-sk-purple font-medium">
                    {s.paragraphs[0]}
                  </a>
                </p>
              ) : (
                s.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)} className="mt-2">
                    {p}
                  </p>
                ))
              )}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
