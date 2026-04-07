/**
 * SpiceKrewe buyer payment — Stripe Elements in Capacitor webview.
 * CLEAN MODEL: card data stays in Stripe iframes; SpiceKrewe API creates PaymentIntents.
 */

import { useMemo, useState, type FormEvent } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { getStripe } from '../lib/stripe';

function PaymentFormInner({
  onSuccess,
  onError,
  apiBaseUrl,
}: {
  onSuccess: () => void;
  onError: (msg: string) => void;
  apiBaseUrl: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const base = apiBaseUrl.replace(/\/$/, '');
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${base}/agreements/payment-complete`,
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message ?? 'Payment failed');
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'requires_capture') {
      onSuccess();
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess();
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      <PaymentElement />
      <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
        Your payment is held securely by Stripe until your service is confirmed complete.
      </p>
      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          backgroundColor: '#4d2f91',
          color: '#fff',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          marginTop: '16px',
          width: '100%',
        }}
      >
        {loading ? 'Processing...' : 'Fund booking'}
      </button>
    </form>
  );
}

interface Props {
  agreementId: string;
  displayAmountCents: number;
  buyerId: string;
  sellerId: string;
  apiBaseUrl: string;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export function AgreementPayment({
  agreementId,
  displayAmountCents,
  buyerId,
  sellerId,
  apiBaseUrl,
  onSuccess = () => {},
  onError = () => {},
}: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initStatus, setInitStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [initError, setInitError] = useState<string | null>(null);

  const stripePromise = useMemo(() => getStripe(), []);

  const initPayment = async () => {
    setInitStatus('loading');
    setInitError(null);
    try {
      const base = apiBaseUrl.replace(/\/$/, '');
      const response = await fetch(`${base}/api/stripe/payment/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementId,
          displayAmountCents,
          currency: 'usd',
          buyerId,
          sellerId,
        }),
      });
      const data = (await response.json()) as {
        clientSecret?: string;
        code?: string;
        error?: string;
      };

      if (data.code === 'PROVIDER_OPERATION') {
        setInitError('Payment features are coming soon.');
        setInitStatus('error');
        return;
      }
      if (data.code === 'SELLER_NOT_ONBOARDED') {
        setInitError('The service provider has not set up their payment account yet. Please try later.');
        setInitStatus('error');
        return;
      }

      if (!response.ok) {
        setInitError(data.error ?? 'Unable to initialize payment');
        setInitStatus('error');
        return;
      }

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setInitStatus('idle');
      } else {
        setInitError('Missing client secret');
        setInitStatus('error');
      }
    } catch {
      setInitError('Unable to initialize payment. Please try again.');
      setInitStatus('error');
    }
  };

  if (initError) {
    return (
      <div>
        <p style={{ color: '#dc2626' }}>{initError}</p>
        <button
          type="button"
          onClick={() => {
            setInitError(null);
            setInitStatus('idle');
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <button
        type="button"
        onClick={() => void initPayment()}
        disabled={initStatus === 'loading'}
        style={{
          backgroundColor: '#4d2f91',
          color: '#fff',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          width: '100%',
        }}
      >
        {initStatus === 'loading' ? 'Preparing payment...' : 'Fund this booking'}
      </button>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#4d2f91',
            colorBackground: '#ffffff',
          },
        },
      }}
    >
      <PaymentFormInner onSuccess={onSuccess} onError={onError} apiBaseUrl={apiBaseUrl} />
    </Elements>
  );
}
