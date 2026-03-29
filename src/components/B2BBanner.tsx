const DEFAULT_ENTERPRISE_EMAIL = 'enterprise@spicekrewe.com';

type Props = {
  /** Defaults to enterprise sales inbox. */
  talkEmail?: string;
};

/**
 * High-impact B2B strip for food brands and restaurant groups (Phase 3 conversion).
 */
export default function B2BBanner({ talkEmail = DEFAULT_ENTERPRISE_EMAIL }: Props) {
  const mailto = `mailto:${encodeURIComponent(talkEmail)}?subject=${encodeURIComponent('Spice Krewe — Teams / retainer inquiry')}`;

  return (
    <section className="bg-sk-purple px-6 py-12">
      <div className="mx-auto flex max-w-[960px] flex-col items-start gap-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-sk-purple-light">
          For food brands + restaurants
        </div>
        <h2 className="m-0 max-w-[640px] text-[18px] font-medium leading-snug tracking-tight text-white">
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
