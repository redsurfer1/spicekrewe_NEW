/**
 * Food truck booking form.
 * Collects all fields required by the food-trucks-book API route.
 * Uses Stripe Elements for payment.
 * Uses useAuth() for buyerId.
 * Uses useCity() for citySlug (passed in as prop from page for explicit routing).
 */

import { useMemo, useState, type FormEvent } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { getStripe } from '../lib/stripe';
import { submitFoodTruckBooking } from '../services/foodTruckApi';
import { useAuth } from '../lib/auth/useAuth';
import { Link } from 'react-router-dom';

const fontStack = '"Barlow Condensed", system-ui, sans-serif';
const primary = '#4d2f91';
const secondary = '#3275bd';

type Props = {
  providerId: string;
  citySlug: string;
};

function PayInner({
  onDone,
  onError,
}: {
  onDone: () => void;
  onError: (m: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${window.location.pathname}`,
      },
      redirect: 'if_required',
    });
    if (error) {
      onError(error.message ?? 'Payment failed');
      setLoading(false);
      return;
    }
    if (
      paymentIntent?.status === 'succeeded' ||
      paymentIntent?.status === 'processing' ||
      paymentIntent?.status === 'requires_capture'
    ) {
      onDone();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={(ev) => void handleSubmit(ev)}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          marginTop: 16,
          width: '100%',
          padding: '12px 24px',
          border: 'none',
          borderRadius: 6,
          background: primary,
          color: '#fff',
          fontFamily: fontStack,
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {loading ? 'Processing…' : 'Pay now'}
      </button>
    </form>
  );
}

export function FoodTruckBookingForm({ providerId, citySlug }: Props) {
  const { buyerId, loading: authLoading } = useAuth();
  const [date, setDate] = useState('');
  const [durationHours, setDurationHours] = useState(2);
  const [headcount, setHeadcount] = useState(25);
  const [eventDescription, setEventDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [amountLabel, setAmountLabel] = useState<string | null>(null);

  const stripePromise = useMemo(() => getStripe(), []);

  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  const runBook = async () => {
    setError(null);
    if (!buyerId) {
      setError('Sign in to continue.');
      return;
    }
    if (!date || !eventDescription.trim() || !locationAddress.trim()) {
      setError('Please complete all required fields.');
      return;
    }
    if (date <= today) {
      setError('Choose a future date.');
      return;
    }
    if (durationHours < 2) {
      setError('Minimum booking is 2 hours.');
      return;
    }
    if (headcount < 1) {
      setError('Guest count must be at least 1.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitFoodTruckBooking({
        truckId: providerId,
        buyerId,
        citySlug,
        headcount,
        eventStart: `${date}T12:00:00.000Z`,
        durationHours,
        eventDescription,
        locationAddress,
      });
      if (!res.clientSecret) {
        setError('Payment could not be started. Try again.');
        setSubmitting(false);
        return;
      }
      setClientSecret(res.clientSecret);
      setAmountLabel(`$${(res.amount / 100).toFixed(2)}`);
      setSubmitting(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Booking failed');
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <p style={{ fontFamily: fontStack }}>Checking your session…</p>;
  }

  if (!buyerId) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          background: '#fff7ed',
          color: '#9a3412',
          fontFamily: fontStack,
        }}
      >
        <p style={{ marginTop: 0 }}>Sign in to book this truck</p>
        <Link to="/login" style={{ fontWeight: 700, color: primary }}>
          Sign in or create an account
        </Link>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: fontStack }}>
      {error && (
        <p style={{ color: '#b91c1c' }} role="alert">
          {error}
        </p>
      )}
      {!clientSecret && !paid && (
        <div style={{ display: 'grid', gap: 12 }}>
          <label>
            Date
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
            />
          </label>
          <label>
            How many hours?
            <input
              type="number"
              min={2}
              step={1}
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
            />
            <span style={{ fontSize: 13, color: secondary }}>Minimum 2 hours</span>
          </label>
          <label>
            Expected guests
            <input
              type="number"
              min={1}
              value={headcount}
              onChange={(e) => setHeadcount(Number(e.target.value))}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
            />
          </label>
          <label>
            Tell us about your event
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              rows={4}
              placeholder="Corporate lunch, birthday party, wedding reception..."
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
            />
          </label>
          <label>
            Event address
            <input
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="123 Main St, Memphis, TN"
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
            />
          </label>
          <button
            type="button"
            onClick={() => void runBook()}
            disabled={submitting}
            style={{
              padding: '12px 20px',
              background: primary,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            {submitting ? 'Preparing payment…' : 'Continue to payment'}
          </button>
        </div>
      )}
      {clientSecret && stripePromise && !paid && (
        <div style={{ marginTop: 16 }}>
          {amountLabel && (
            <p style={{ color: secondary, fontSize: 18 }}>
              Amount due: <strong>{amountLabel}</strong>
            </p>
          )}
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PayInner onDone={() => setPaid(true)} onError={(m) => setError(m)} />
          </Elements>
        </div>
      )}
      {paid && (
        <p style={{ color: '#15803d', marginTop: 16 }}>
          Payment received — your food truck booking request is pending confirmation.
        </p>
      )}
    </div>
  );
}
