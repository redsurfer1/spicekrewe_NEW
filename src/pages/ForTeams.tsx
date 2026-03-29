import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const ENTERPRISE_EMAIL = 'enterprise@spicekrewe.com';
const MAILTO_HREF = `mailto:${encodeURIComponent(ENTERPRISE_EMAIL)}?subject=${encodeURIComponent('Spice Krewe — Enterprise sales')}`;

export default function ForTeams() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--sk-body-bg)' }}>
      <SEO
        title="Culinary R&D for Teams | Spice Krewe"
        description="Enterprise retainer access to vetted culinary R&D, formulation, and content intelligence. Secure collaboration and consolidated billing."
        path="/for-teams"
        ogTitle="Culinary R&D for Teams | Spice Krewe"
        ogDescription="Scale culinary IP and intelligence without adding headcount. Spice Krewe for food brands and restaurant groups."
      />
      <Navbar />

      {/* Hero */}
      <section
        style={{
          background: 'var(--sk-navy)',
          color: '#fff',
          padding: '64px 24px 72px',
        }}
      >
        <div
          className="mx-auto grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12"
          style={{ maxWidth: 1100 }}
        >
          <div>
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
              Enterprise
            </p>
            <h1
              style={{
                margin: '0 0 16px',
                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              Scale your R&amp;D
            </h1>
            <p
              style={{
                margin: '0 0 20px',
                fontSize: 17,
                lineHeight: 1.65,
                color: 'var(--sk-fg-on-dark)',
                maxWidth: 520,
              }}
            >
              You bring the craft—we make it easy to scale. Access credentialed formulation, sensory, and content
              specialists through one operating layer, protect culinary IP, and move faster from bench to launch.
            </p>
            <a
              href={MAILTO_HREF}
              className="inline-flex items-center justify-center"
              style={{
                minHeight: 44,
                padding: '14px 26px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 'var(--sk-radius-md)',
                background: 'var(--sk-purple)',
                color: '#fff',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
                boxSizing: 'border-box',
              }}
            >
              Contact Enterprise Sales
            </a>
          </div>
          <div
            style={{
              borderRadius: 'var(--sk-radius-lg)',
              border: '1px solid rgba(185, 158, 232, 0.25)',
              background: 'rgba(77, 47, 145, 0.35)',
              padding: '28px 24px',
            }}
          >
            <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--sk-fg-on-dark)', fontSize: 15, lineHeight: 1.85 }}>
              <li>One governance model for briefs, approvals, and deliverables</li>
              <li>Structured handoffs between formulation, regulatory touchpoints, and creative</li>
              <li>Measurable milestones aligned to your stage-gate process</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Proven voice — adapted from legacy “buyer stories”; reframed for B2B trust */}
      <section style={{ padding: '56px 24px', background: 'var(--sk-body-bg)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p
            style={{
              margin: '0 0 20px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--sk-gold)',
              textAlign: 'center',
            }}
          >
            Voices from the network
          </p>
          <h2
            style={{
              margin: '0 0 32px',
              fontSize: 'clamp(1.35rem, 3vw, 1.5rem)',
              fontWeight: 700,
              color: 'var(--sk-navy)',
              textAlign: 'center',
              maxWidth: 640,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Proof points teams still quote years later
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Spice Krewe Culinary is an amazing resource for anyone in the startup space."
              attribution="Alex Saunders"
              role="Founder / operator"
            />
            <TestimonialCard
              quote="People love our culinary services, and we love Spice Krewe Culinary."
              attribution="Ricky Jones"
              role="Brand & creative lead"
            />
            <TestimonialCard
              quote="There is no way I could have produced anything without Spice Krewe Culinary."
              attribution="Melissa Ross"
              role="Producer / growth"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '64px 24px', background: 'var(--sk-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2
            style={{
              margin: '0 0 12px',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--sk-purple)',
            }}
          >
            Why teams choose Spice Krewe
          </h2>
          <p
            style={{
              margin: '0 0 40px',
              fontSize: 'clamp(1.35rem, 3vw, 1.75rem)',
              fontWeight: 600,
              color: 'var(--sk-navy)',
              maxWidth: 640,
              lineHeight: 1.3,
            }}
          >
            Culinary intelligence, delivered with the rigor your stakeholders expect.
          </p>
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            style={{ alignItems: 'stretch' }}
          >
            <FeatureCard
              title="Vetted expertise"
              body="Every engagement is routed through the SK Culinary Standard—credentialing, portfolio review, and fit-for-scope validation before work begins."
            />
            <FeatureCard
              title="Secure collaboration"
              body="Project narratives pass through our Privacy Shield workflow so proprietary formulations, pipeline details, and partner data stay controlled end to end."
            />
            <FeatureCard
              title="Streamlined payments"
              body="One invoice covers multiple specialists. Finance sees a single commercial thread while your team executes across workstreams."
            />
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={{ padding: '64px 24px', background: 'var(--sk-body-bg)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2
            style={{
              margin: '0 0 36px',
              fontSize: 'clamp(1.35rem, 3vw, 1.75rem)',
              fontWeight: 700,
              color: 'var(--sk-navy)',
              textAlign: 'center',
            }}
          >
            How it works
          </h2>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 28 }}>
            <ProcessStep
              n={1}
              title="Define your scope"
              text="Post the work—briefs, constraints, and success criteria—so we can route credentialed pros to each track (like “create the gig,” enterprise-grade)."
            />
            <ProcessStep
              n={2}
              title="Deliver at Krewe standard"
              text="Execute with vetted talent across R&D, sensory, styling, and content. One operating rhythm, visible milestones, fewer handoff gaps."
            />
            <ProcessStep
              n={3}
              title="Commercial clarity"
              text="Consolidated billing options and clear payment milestones—so finance sees one thread while your team ships."
            />
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '56px 24px 72px', background: 'var(--sk-surface)', textAlign: 'center' }}>
        <h2
          style={{
            margin: '0 0 12px',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 700,
            color: 'var(--sk-navy)',
          }}
        >
          Ready to operationalize culinary IP?
        </h2>
        <p style={{ margin: '0 auto 28px', maxWidth: 480, fontSize: 16, color: 'var(--sk-text-subtle)', lineHeight: 1.6 }}>
          Speak with our enterprise team about retainer structures, security review, and onboarding.
        </p>
        <a
          href={MAILTO_HREF}
          className="inline-flex items-center justify-center w-full max-w-sm sm:w-auto"
          style={{
            minHeight: 44,
            padding: '16px 36px',
            fontSize: 16,
            fontWeight: 700,
            borderRadius: 'var(--sk-radius-md)',
            background: 'var(--sk-purple)',
            color: '#fff',
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          Contact Enterprise Sales
        </a>
      </section>

      <Footer />
    </div>
  );
}

function TestimonialCard({ quote, attribution, role }: { quote: string; attribution: string; role: string }) {
  return (
    <figure
      style={{
        margin: 0,
        borderRadius: 'var(--sk-radius-lg)',
        border: '1px solid var(--sk-card-border)',
        background: 'var(--sk-surface)',
        padding: '22px 20px',
        boxShadow: '0 8px 24px rgba(26, 26, 46, 0.06)',
      }}
    >
      <blockquote style={{ margin: 0, padding: 0 }}>
        <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.65, color: 'var(--sk-text-muted)' }}>
          “{quote}”
        </p>
        <figcaption style={{ fontSize: 14, fontWeight: 700, color: 'var(--sk-navy)' }}>{attribution}</figcaption>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--sk-text-subtle)' }}>{role}</p>
      </blockquote>
    </figure>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <article
      style={{
        borderRadius: 'var(--sk-radius-lg)',
        border: '1px solid var(--sk-card-border)',
        padding: '24px 22px',
        background: 'var(--sk-body-bg)',
        height: '100%',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: 'var(--sk-navy)' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--sk-text-muted)' }}>{body}</p>
    </article>
  );
}

function ProcessStep({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <li style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <span
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'var(--sk-purple)',
          color: '#fff',
          fontWeight: 800,
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden
      >
        {n}
      </span>
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--sk-navy)' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--sk-text-muted)' }}>{text}</p>
      </div>
    </li>
  );
}
