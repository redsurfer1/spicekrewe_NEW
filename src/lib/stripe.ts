/**
 * Stripe.js client for SpiceKrewe (Capacitor / Vite).
 *
 * CLEAN MODEL: Loads Stripe.js for future PaymentIntent confirmation flows.
 * Secret keys never belong in the app; PaymentIntents are created by the Flomisma backend.
 *
 * See: FLOMISMA_PLATFORM/docs/dual-entity-operating-boundary.md
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripeInstance: Promise<Stripe | null>;

export function getStripe(): Promise<Stripe | null> {
  if (!stripeInstance) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim();
    if (!key) {
      return Promise.resolve(null);
    }
    stripeInstance = loadStripe(key);
  }
  return stripeInstance;
}

export { STRIPE_STATUS_MAP, type PaymentStatusDisplay } from './stripe-status-map';
