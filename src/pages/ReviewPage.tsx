import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const fontBarlow = '"Barlow Condensed", system-ui, sans-serif';
const primary = '#4d2f91';

export default function ReviewPage() {
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId')?.trim() ?? '';
  const token = params.get('token')?.trim() ?? '';
  const buyerId = params.get('buyerId')?.trim() ?? '';
  const providerId = params.get('providerId')?.trim() ?? '';
  const providerName = params.get('providerName')?.trim() ?? 'your provider';
  const eventDate = params.get('eventDate')?.trim() ?? '';
  const bookingType = params.get('bookingType')?.trim() === 'chef' ? 'chef' : 'food_truck';

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [wouldBookAgain, setWouldBookAgain] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validParams = bookingId && token && buyerId && providerId;

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  const onSubmit = async () => {
    if (!validParams || rating < 1) return;
    setError(null);
    setSubmitting(true);
    const origin = import.meta.env.VITE_APP_ORIGIN?.replace(/\/$/, '') ?? '';
    try {
      const res = await fetch(`${origin}/api/submit-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          bookingId,
          buyerId,
          providerId,
          bookingType,
          rating,
          reviewText: reviewText.trim(),
          wouldBookAgain: wouldBookAgain === null ? undefined : wouldBookAgain,
          token,
        }),
      });
      const json = (await res.json()) as { error?: string; success?: boolean };
      if (res.status === 409) {
        setError('You have already submitted a review for this booking.');
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        setError(typeof json.error === 'string' ? json.error : 'Unable to submit review');
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError('Network error — try again shortly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sk-body-bg flex flex-col">
      <SEO title="Leave a review | SpiceKrewe" path="/review" />
      <Navbar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6">
        {!validParams ? (
          <div className="rounded-sk-lg border border-sk-card-border bg-white p-8 shadow-sm">
            <h1 className="m-0 text-2xl font-bold text-sk-navy" style={{ fontFamily: fontBarlow }}>
              Review link incomplete
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-sk-text-muted">
              Open the review link from your confirmation email, or contact support if you need help.
            </p>
            <Link to="/" className="mt-6 inline-block font-bold text-sk-purple">
              Back to home
            </Link>
          </div>
        ) : done ? (
          <div className="rounded-sk-lg border border-sk-card-border bg-white p-8 text-center shadow-sm">
            <h1 className="m-0 text-2xl font-bold" style={{ fontFamily: fontBarlow, color: primary }}>
              Thank you for your review!
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-sk-text-muted">
              Your feedback helps the SpiceKrewe community find the best chefs and food trucks in Memphis.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-sk-md px-6 text-sm font-bold text-white no-underline"
              style={{ background: primary, fontFamily: fontBarlow }}
            >
              Back to home
            </Link>
          </div>
        ) : (
          <div className="rounded-sk-lg border border-sk-card-border bg-white p-8 shadow-sm">
            <h1 className="m-0 text-2xl font-bold text-sk-navy" style={{ fontFamily: fontBarlow }}>
              Rate your experience
            </h1>
            <p className="mt-2 text-sm text-sk-text-muted">
              {eventDate
                ? `Tell us how ${providerName} did on ${eventDate}.`
                : `Tell us about your experience with ${providerName}.`}
            </p>

            <div className="mt-6">
              <p className="m-0 text-xs font-bold uppercase tracking-wider text-sk-gold">Star rating</p>
              <div className="mt-2 flex gap-2" role="group" aria-label="Star rating">
                {stars.map((s) => {
                  const active = (hover || rating) >= s;
                  return (
                    <button
                      key={s}
                      type="button"
                      className="text-3xl leading-none border-0 bg-transparent cursor-pointer p-1"
                      aria-label={`${s} star${s > 1 ? 's' : ''}`}
                      onMouseEnter={() => setHover(s)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(s)}
                    >
                      <span style={{ color: active ? '#e6a800' : '#d1d5db' }} aria-hidden>
                        ★
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-6 block">
              <span className="text-sm font-bold text-sk-navy">Your review</span>
              <textarea
                className="mt-2 w-full min-h-[120px] rounded-sk-md border border-sk-card-border px-3 py-2 text-base"
                placeholder={`Tell others about your experience with ${providerName}`}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </label>

            <div className="mt-6">
              <p className="m-0 text-sm font-bold text-sk-navy">Would you book them again?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`min-h-[40px] rounded-sk-md px-4 text-sm font-bold ${
                    wouldBookAgain === true ? 'text-white' : 'border border-sk-card-border bg-sk-body-bg'
                  }`}
                  style={wouldBookAgain === true ? { background: primary } : undefined}
                  onClick={() => setWouldBookAgain(true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`min-h-[40px] rounded-sk-md px-4 text-sm font-bold ${
                    wouldBookAgain === false ? 'text-white' : 'border border-sk-card-border bg-sk-body-bg'
                  }`}
                  style={wouldBookAgain === false ? { background: primary } : undefined}
                  onClick={() => setWouldBookAgain(false)}
                >
                  No
                </button>
              </div>
            </div>

            {error ? (
              <p className="mt-4 text-sm font-semibold text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={submitting || rating < 1}
              onClick={() => void onSubmit()}
              className="mt-8 w-full min-h-[48px] rounded-sk-md text-base font-bold text-white shadow-md"
              style={{ background: primary, fontFamily: fontBarlow, opacity: submitting || rating < 1 ? 0.6 : 1 }}
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
