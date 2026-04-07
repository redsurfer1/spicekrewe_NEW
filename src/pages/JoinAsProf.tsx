import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useCity } from '../context/CityContext';

const fontBarlow = '"Barlow Condensed", system-ui, sans-serif';
const primary = '#4d2f91';
const secondary = '#3275bd';

const CUISINES = ['Southern', 'BBQ', 'Italian', 'Mexican', 'Mediterranean', 'Asian', 'Fusion', 'Other'] as const;

type ProviderKind = 'private_chef' | 'food_truck';

export default function JoinAsProf() {
  const [searchParams] = useSearchParams();
  const { cityDisplayName, availableCities } = useCity();
  const [step, setStep] = useState<1 | 2 | 'done'>(1);
  const [kind, setKind] = useState<ProviderKind | null>(() =>
    searchParams.get('type') === 'food_truck' ? 'food_truck' : null,
  );

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(cityDisplayName);
  const [bio, setBio] = useState('');
  const [rate, setRate] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [truckName, setTruckName] = useState('');
  const [maxGuests, setMaxGuests] = useState('');
  const [powerRequired, setPowerRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCity(cityDisplayName);
  }, [cityDisplayName]);

  const cityOptions = useMemo(() => {
    const live = availableCities.filter((c) => c.isLive);
    if (live.length > 0) return live.map((c) => ({ value: c.displayName, label: `${c.displayName}, ${c.stateCode}` }));
    return [{ value: 'Memphis', label: 'Memphis, TN' }];
  }, [availableCities]);

  const toggleCuisine = (c: string) => {
    setSelectedCuisines((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const onSubmit = useCallback(async () => {
    if (!kind) return;
    setError(null);
    setSubmitting(true);
    const rateNum = Number(rate);
    const maxG = kind === 'food_truck' ? Number(maxGuests) : NaN;
    try {
      const origin = import.meta.env.VITE_APP_ORIGIN?.replace(/\/$/, '') ?? '';
      const res = await fetch(`${origin}/api/provider-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          providerType: kind,
          displayName: displayName.trim(),
          email: email.trim(),
          city: city.trim(),
          cuisines: selectedCuisines,
          bio: bio.trim(),
          rate: rateNum,
          truckName: kind === 'food_truck' ? truckName.trim() : undefined,
          maxGuests: kind === 'food_truck' ? maxG : undefined,
          powerRequired: kind === 'food_truck' ? powerRequired : undefined,
        }),
      });
      const json = (await res.json()) as { error?: string; success?: boolean };
      if (!res.ok) {
        setError(typeof json.error === 'string' ? json.error : 'Unable to submit');
        setSubmitting(false);
        return;
      }
      setStep('done');
    } catch {
      setError('Network error — try again shortly.');
    } finally {
      setSubmitting(false);
    }
  }, [kind, displayName, email, city, selectedCuisines, bio, rate, truckName, maxGuests, powerRequired]);

  return (
    <div className="min-h-screen bg-sk-body-bg flex flex-col">
      <SEO
        title="List your services on SpiceKrewe"
        description="Join Memphis's trusted booking platform for private chefs and food trucks."
        path="/join"
      />
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <header className="mb-8 text-center">
          <h1 className="m-0 text-3xl font-extrabold text-sk-navy sm:text-4xl" style={{ fontFamily: fontBarlow }}>
            List your services on SpiceKrewe
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-sk-text-muted">
            Memphis&apos;s trusted booking platform for private chefs and food trucks. Set your own rates. Keep 95% of
            every booking.
          </p>
          <ul className="mx-auto mt-6 max-w-md list-none space-y-2 p-0 text-left text-sm text-sk-navy">
            <li>✓ Free to join and list</li>
            <li>✓ AI concierge sends you qualified leads</li>
            <li>✓ Get paid securely through Stripe</li>
          </ul>
        </header>

        {step === 'done' ? (
          <div
            className="rounded-sk-lg border border-sk-card-border bg-white p-8 text-center shadow-sm"
            style={{ fontFamily: fontBarlow }}
          >
            <h2 className="m-0 text-2xl font-bold" style={{ color: primary }}>
              Welcome to SpiceKrewe!
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-sk-text-muted">
              Check your email to confirm your account. We will be in touch within 24 hours to complete your profile and
              get you listed.
            </p>
          </div>
        ) : step === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setKind('private_chef');
                setStep(2);
              }}
              className="rounded-sk-lg border-2 border-sk-card-border bg-white p-6 text-left shadow-sm transition-colors hover:border-sk-purple"
            >
              <div className="text-3xl" aria-hidden>
                👨‍🍳
              </div>
              <h2 className="mt-3 text-xl font-bold text-sk-navy" style={{ fontFamily: fontBarlow }}>
                I am a Private Chef
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-sk-text-muted">
                Cook intimate dinners, celebrations, and special occasions.
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setKind('food_truck');
                setStep(2);
              }}
              className="rounded-sk-lg border-2 border-sk-card-border bg-white p-6 text-left shadow-sm transition-colors hover:border-sk-purple"
            >
              <div className="text-3xl" aria-hidden>
                🚚
              </div>
              <h2 className="mt-3 text-xl font-bold text-sk-navy" style={{ fontFamily: fontBarlow }}>
                I operate a Food Truck
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-sk-text-muted">
                Serve corporate events, parties, and outdoor gatherings.
              </p>
            </button>
          </div>
        ) : (
          <form
            className="space-y-5 rounded-sk-lg border border-sk-card-border bg-white p-6 shadow-sm sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmit();
            }}
            style={{ fontFamily: fontBarlow }}
          >
            <button
              type="button"
              className="text-sm font-semibold text-sk-purple no-underline"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: secondary }}>
              {kind === 'food_truck' ? 'Food truck signup' : 'Private chef signup'}
            </p>

            <label className="block">
              <span className="text-sm font-bold text-sk-navy">Full name (display name)</span>
              <input
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full min-h-[48px] rounded-sk-md border border-sk-card-border px-3 text-base"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-sk-navy">Email address</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full min-h-[48px] rounded-sk-md border border-sk-card-border px-3 text-base"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-sk-navy">City</span>
              <select
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full min-h-[48px] rounded-sk-md border border-sk-card-border px-3 text-base bg-white"
              >
                {cityOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm font-bold text-sk-navy">Cuisine specialties</legend>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map((c) => {
                  const on = selectedCuisines.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCuisine(c)}
                      className={`min-h-[40px] rounded-sk-pill border px-3 text-xs font-bold ${
                        on ? 'text-white' : 'border-sk-card-border bg-sk-body-bg text-sk-navy'
                      }`}
                      style={on ? { background: primary } : undefined}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label className="block">
              <span className="text-sm font-bold text-sk-navy">Short bio (50–300 characters)</span>
              <textarea
                required
                minLength={50}
                maxLength={300}
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full rounded-sk-md border border-sk-card-border px-3 py-2 text-base"
              />
              <span className="text-xs text-sk-text-soft">{bio.length}/300</span>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-sk-navy">Hourly or per-event rate (USD)</span>
              <input
                required
                type="number"
                min={1}
                step={1}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="mt-1 w-full min-h-[48px] rounded-sk-md border border-sk-card-border px-3 text-base"
                placeholder="e.g. 175"
              />
            </label>

            {kind === 'food_truck' ? (
              <>
                <label className="block">
                  <span className="text-sm font-bold text-sk-navy">Truck name</span>
                  <input
                    required
                    value={truckName}
                    onChange={(e) => setTruckName(e.target.value)}
                    className="mt-1 w-full min-h-[48px] rounded-sk-md border border-sk-card-border px-3 text-base"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-sk-navy">Maximum guest capacity</span>
                  <input
                    required
                    type="number"
                    min={1}
                    step={1}
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(e.target.value)}
                    className="mt-1 w-full min-h-[48px] rounded-sk-md border border-sk-card-border px-3 text-base"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-sk-navy">
                  <input
                    type="checkbox"
                    checked={powerRequired}
                    onChange={(e) => setPowerRequired(e.target.checked)}
                    className="h-4 w-4 accent-sk-purple"
                  />
                  Power hookup required?
                </label>
              </>
            ) : null}

            {error ? (
              <p className="text-sm font-semibold text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] rounded-sk-md text-base font-bold text-white shadow-md"
              style={{ background: primary, opacity: submitting ? 0.75 : 1 }}
            >
              {submitting ? 'Submitting…' : 'Join SpiceKrewe'}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
