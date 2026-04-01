import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { PRIVACY_LAST_UPDATED, PRIVACY_SECTIONS } from '../content/legal/complianceCopy';
import { Link } from 'react-router-dom';

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

          <section>
            <h2 className="text-lg font-semibold text-sk-navy">What data we collect</h2>
            <p className="mt-2">
              We only collect the data we need to operate the Spice Krewe marketplace and match you with the right
              culinary talent. This includes:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>
                <span className="font-medium">Account details</span>: name and email address you provide when creating
                an account.
              </li>
              <li>
                <span className="font-medium">Project brief content</span>: details you share in a brief, including
                specialty, budget, timeline, description, and required skills.
              </li>
              <li>
                <span className="font-medium">Payment information</span>: payments are processed by Stripe. We store the
                Stripe session ID and related metadata, but we never store full card numbers or CVV.
              </li>
              <li>
                <span className="font-medium">Usage data</span>: brief submission timestamps, login events, and match
                lifecycle events used for audit and service quality.
              </li>
              <li>
                <span className="font-medium">Match feedback ratings</span>: satisfaction scores you submit after a
                booking, tied to the booking but not publicly attributed.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-sk-navy">How long we keep your data</h2>
            <p className="mt-2">
              Our retention policy balances your privacy rights with our legal and operational obligations:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>
                <span className="font-medium">Active account data</span>: retained while your account remains active so
                we can provide the service.
              </li>
              <li>
                <span className="font-medium">Cancelled or closed project briefs</span>: retained for 2 years and then
                soft-deleted from active views.
              </li>
              <li>
                <span className="font-medium">Audit logs</span>: retained for 7 years to meet security and compliance
                requirements.
              </li>
              <li>
                <span className="font-medium">Payment records</span>: retained for 7 years for tax, accounting, and
                fraud prevention obligations.
              </li>
              <li>
                <span className="font-medium">Account deletion</span>: when you request deletion, we remove or
                anonymize personal data within 30 days. Project records may be anonymized (for example, replacing your
                name with a random identifier) rather than deleted to preserve platform integrity and anti-fraud
                controls.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-sk-navy">Your rights</h2>
            <p className="mt-2">
              Depending on where you live, you may have certain rights over your personal data. Regardless of location,
              Spice Krewe provides the following:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>
                <span className="font-medium">Right to access</span>: you can request a copy of the personal data we
                hold about you by emailing{' '}
                <a href="mailto:privacy@spicekrewe.com" className="text-sk-purple font-medium">
                  privacy@spicekrewe.com
                </a>
                .
              </li>
              <li>
                <span className="font-medium">Right to deletion</span>: you can request deletion of your account and
                associated personal data by submitting a request via the{' '}
                <Link to="/data-request" className="text-sk-purple font-medium underline">
                  data request form
                </Link>{' '}
                or emailing{' '}
                <a href="mailto:privacy@spicekrewe.com" className="text-sk-purple font-medium">
                  privacy@spicekrewe.com
                </a>
                .
              </li>
              <li>
                <span className="font-medium">Right to correction</span>: you can update most profile details directly
                from your{' '}
                <Link to="/dashboard" className="text-sk-purple font-medium underline">
                  dashboard
                </Link>{' '}
                or contact us at{' '}
                <a href="mailto:privacy@spicekrewe.com" className="text-sk-purple font-medium">
                  privacy@spicekrewe.com
                </a>{' '}
                to request corrections.
              </li>
              <li>
                <span className="font-medium">Right to portability</span>: you can request an export of your personal
                data in a machine-readable (JSON) format by emailing{' '}
                <a href="mailto:privacy@spicekrewe.com" className="text-sk-purple font-medium">
                  privacy@spicekrewe.com
                </a>
                .
              </li>
              <li>
                <span className="font-medium">Response time</span>: we respond to all verified privacy requests within
                30 days.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-sk-navy">Third-party processors</h2>
            <p className="mt-2">
              We rely on a small set of vetted processors to run the platform. Each processor is contractually bound to
              protect your data and use it only to provide services to Spice Krewe:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>
                <span className="font-medium">Supabase</span> – database and authentication. Supabase is SOC 2 Type II
                certified.
              </li>
              <li>
                <span className="font-medium">Stripe</span> – payment processing. Stripe is PCI DSS Level 1 certified.
              </li>
              <li>
                <span className="font-medium">Vercel</span> – hosting and edge infrastructure, SOC 2 Type II certified.
              </li>
              <li>
                <span className="font-medium">Google Gemini</span> – AI-powered matching and scoping, running on Google
                Cloud&apos;s certified infrastructure.
              </li>
              <li>
                <span className="font-medium">Resend</span> – transactional email delivery, SOC 2 certified.
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
