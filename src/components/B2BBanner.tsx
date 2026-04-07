const DEFAULT_ENTERPRISE_EMAIL = 'enterprise@spicekrewe.com';

type Props = {
  /** Defaults to enterprise sales inbox. */
  talkEmail?: string;
};

/**
 * High-impact B2B strip for teams and companies (Phase 3 conversion).
 */
export default function B2BBanner({ talkEmail = DEFAULT_ENTERPRISE_EMAIL }: Props) {
  const mailto = `mailto:${encodeURIComponent(talkEmail)}?subject=${encodeURIComponent('Spice Krewe — Teams / retainer inquiry')}`;

  return (
    <section
      className="relative z-[1] bg-sk-purple px-6 py-12 text-white"
      style={{ backgroundColor: 'var(--sk-purple)', color: '#fff' }}
      aria-labelledby="sk-b2b-banner-heading"
    >
      <div className="mx-auto flex max-w-[960px] flex-col items-start gap-4">
        <p
          id="sk-b2b-banner-eyebrow"
          className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-sk-gold"
          style={{ color: 'var(--sk-gold)' }}
        >
          For teams + restaurants
        </p>
        <h2
          id="sk-b2b-banner-heading"
          className="m-0 max-w-[640px] text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl"
          style={{ color: '#fff' }}
        >
          On-demand culinary R&amp;D — without the headcount
        </h2>
        <p className="m-0 max-w-[560px] text-base leading-relaxed text-sk-fg-on-dark">
          Retainer access to Spice Krewe&apos;s full professional network. Starting at $1,000/mo.
        </p>
        <a
          href={mailto}
          className="mt-2 inline-flex items-center gap-2 rounded-sk-md bg-sk-gold px-[22px] py-3 text-sm font-bold text-sk-navy no-underline"
        >
          Talk to us
          <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}
