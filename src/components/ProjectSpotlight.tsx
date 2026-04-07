import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const AVATAR_SWATCHES = ['var(--sk-purple)', 'var(--sk-gold)', 'var(--sk-blue)'];
const AVATAR_INITIALS = ['MJ', 'AL', 'DN'];

/**
 * Event booking social proof — homepage (narrow model).
 */
export default function ProjectSpotlight() {
  return (
    <section className="bg-sk-body-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-sk-enter">
        <article className="overflow-hidden rounded-sk-lg border border-sk-gold/25 bg-sk-navy shadow-xl shadow-black/20">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="flex flex-col justify-center gap-6 p-8 sm:p-10 lg:p-12">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-sk-gold">Success story</p>
              <h2 className="m-0 text-2xl font-semibold leading-snug tracking-tight text-white sm:text-[1.65rem]">
                Private chef booked for a 20-person anniversary dinner
              </h2>

              <dl className="m-0 flex flex-col gap-5 text-[15px] leading-relaxed text-white/90">
                <div>
                  <dt className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-sk-gold">Host</dt>
                  <dd className="m-0 font-medium text-white">Memphis Heritage BBQ Group (family celebration)</dd>
                </div>
                <div>
                  <dt className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-sk-gold">The event</dt>
                  <dd className="m-0 text-white/88">
                    A seated dinner with Southern barbecue touches, dietary accommodations, and full service for twenty
                    guests at a private home.
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-sk-gold">The outcome</dt>
                  <dd className="m-0 text-white/88">
                    Guests enjoyed a curated menu, on-time service, and a stress-free host experience — booked through
                    SpiceKrewe verified chefs.
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center gap-3 rounded-sk-md border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-sk-purple-light">
                  Matched with 3 Pros
                </span>
                <div className="flex -space-x-2" aria-hidden>
                  {AVATAR_INITIALS.map((ini, i) => (
                    <span
                      key={ini}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-sk-navy text-[10px] font-bold text-white"
                      style={{ background: AVATAR_SWATCHES[i % AVATAR_SWATCHES.length], zIndex: 3 - i }}
                    >
                      {ini}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                to="/concierge"
                className="inline-flex w-fit items-center text-sm font-semibold text-sk-purple-light underline-offset-4 transition-colors hover:text-white"
              >
                Plan your event
              </Link>
            </div>

            <div className="relative min-h-[220px] bg-gradient-to-br from-sk-purple/40 via-sk-navy to-sk-navy-mid lg:min-h-full">
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(230, 168, 0, 0.35), transparent 45%)',
                }}
              />
              <div className="relative flex h-full min-h-[220px] flex-col items-center justify-center gap-4 p-8 lg:min-h-0">
                <div className="flex h-24 w-24 items-center justify-center rounded-sk-lg border border-white/15 bg-white/5">
                  <ChefHat className="h-12 w-12 text-sk-gold/90" strokeWidth={1.25} aria-hidden />
                </div>
                <p className="m-0 max-w-[240px] text-center text-xs font-medium leading-relaxed text-white/55">
                  Private dining &amp; event service (illustrative)
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
