/**
 * SpiceKrewe event concierge — 4-step brief + package review (free concierge service).
 * Colors: #4d2f91 / #3275bd — Barlow Condensed (matches tenant config).
 */

import { useState } from 'react';
import {
  acceptConciergePackage,
  submitConciergeBrief,
  type ConciergeSubmitBody,
} from '../services/api';

const fontStack = '"Barlow Condensed", system-ui, sans-serif';

type Props = {
  citySlug: string;
  cityDisplayName: string;
  buyerId: string;
};

type PackageView = {
  id: string;
  eventScale?: 'intimate' | 'gathering' | 'large';
  packageItems: Array<{
    providerId: string;
    providerName: string;
    providerType?: 'private_chef' | 'food_truck';
    serviceType: string;
    estimatedCostCents: number;
    notes?: string;
  }>;
  estimatedTotalCents: number;
  packageNarrative: string;
};

export function ConciergeForm({ citySlug, cityDisplayName, buyerId }: Props) {
  const [step, setStep] = useState(1);
  const [eventType, setEventType] = useState('');
  const [guestCount, setGuestCount] = useState(8);
  const [eventDate, setEventDate] = useState('');
  const [theme, setTheme] = useState('');
  const [budgetDollars, setBudgetDollars] = useState(2500);
  const [locationNotes, setLocationNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefId, setBriefId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pkg, setPkg] = useState<PackageView | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const runSubmit = async () => {
    setLoading(true);
    setError(null);
    const body: ConciergeSubmitBody = {
      tenantId: 'spice_krewe',
      citySlug,
      buyerId,
      eventType,
      guestCount,
      theme: theme || undefined,
      budgetCents: Math.round(budgetDollars * 100),
      eventDate: eventDate || undefined,
      locationNotes: locationNotes || undefined,
    };
    const res = await submitConciergeBrief(body);
    setLoading(false);
    if (!res.success || !res.data) {
      setError(res.error ?? 'Unable to submit brief');
      return;
    }
    setBriefId(res.data.briefId);
    setStatus(res.data.status);
    if (res.data.package) {
      setPkg({
        id: res.data.package.id,
        eventScale: res.data.package.eventScale,
        packageItems: res.data.package.packageItems ?? [],
        estimatedTotalCents: res.data.package.estimatedTotalCents ?? 0,
        packageNarrative: res.data.package.packageNarrative ?? '',
      });
    }
    setStep(4);
  };

  const onAccept = async () => {
    if (!briefId || !pkg) return;
    setLoading(true);
    setError(null);
    const res = await acceptConciergePackage(briefId, pkg.id, buyerId);
    setLoading(false);
    if (!res.success) {
      setError(res.error ?? 'Unable to confirm package');
      return;
    }
    setConfirmed(true);
  };

  const headingStyle = {
    fontFamily: fontStack,
    color: '#4d2f91',
    fontWeight: 800 as const,
    letterSpacing: '0.02em',
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ ...headingStyle, fontSize: 36 }}>
        Book your perfect {cityDisplayName} culinary experience
      </h1>
      <p style={{ fontFamily: fontStack, color: '#3275bd', fontSize: 18 }}>
        {cityDisplayName} · free AI concierge
      </p>

      {error && (
        <p style={{ color: '#b91c1c', fontFamily: fontStack }} role="alert">
          {error}
        </p>
      )}

      {step === 1 && (
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ fontFamily: fontStack }}>
            Event type
            <input
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
              placeholder="e.g. Corporate dinner"
            />
          </label>
          <label style={{ fontFamily: fontStack }}>
            Guest count
            <input
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
            />
            <span style={{ display: 'block', fontSize: 14, color: '#3275bd', marginTop: 6 }}>
              {guestCount <= 20 && "We'll recommend a private chef for your intimate event"}
              {guestCount >= 21 &&
                guestCount <= 75 &&
                "We'll find the perfect chef or food truck for your gathering"}
              {guestCount >= 76 && "We'll recommend food trucks suited for your large event"}
            </span>
          </label>
          <label style={{ fontFamily: fontStack }}>
            Event date
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
            />
          </label>
          <button
            type="button"
            onClick={() => setStep(2)}
            style={{
              marginTop: 8,
              padding: '12px 20px',
              background: '#3275bd',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontFamily: fontStack,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ fontFamily: fontStack }}>
            Theme / vibe
            <textarea
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              rows={3}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
            />
          </label>
          <label style={{ fontFamily: fontStack }}>
            Budget (USD)
            <input
              type="number"
              min={100}
              value={budgetDollars}
              onChange={(e) => setBudgetDollars(Number(e.target.value))}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
            />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ padding: '10px 16px', fontFamily: fontStack }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              style={{
                padding: '12px 20px',
                background: '#3275bd',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontFamily: fontStack,
                fontWeight: 700,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ fontFamily: fontStack }}>
            Location notes
            <textarea
              value={locationNotes}
              onChange={(e) => setLocationNotes(e.target.value)}
              rows={4}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8 }}
              placeholder="Neighborhood, venue type, parking, dietary needs…"
            />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setStep(2)} style={{ fontFamily: fontStack }}>
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(4);
                void runSubmit();
              }}
              disabled={loading}
              style={{
                padding: '12px 20px',
                background: '#4d2f91',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontFamily: fontStack,
                fontWeight: 800,
              }}
            >
              {loading ? 'Finding the perfect team…' : 'Build my package'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          {loading && !pkg && (
            <p style={{ fontFamily: fontStack, fontSize: 22, color: '#3275bd' }}>
              Finding the perfect team…
            </p>
          )}

          {status === 'pending_review' && (
            <p style={{ fontFamily: fontStack, fontSize: 18, color: '#4d2f91' }}>
              Thanks — this brief is in a <strong>24-hour human review</strong> because estimated spend is
              high. We will email you when it clears.
            </p>
          )}

          {pkg && status === 'ready' && (
            <>
              <h2 style={{ ...headingStyle, fontSize: 26 }}>Recommended team</h2>
              <p style={{ fontFamily: fontStack, fontSize: 17 }}>{pkg.packageNarrative}</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {pkg.packageItems.map((it) => (
                  <li
                    key={it.providerId}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                      fontFamily: fontStack,
                    }}
                  >
                    <strong>{it.providerName}</strong> — {it.serviceType}
                    <div style={{ marginTop: 6 }}>
                      {(it.providerType ?? 'private_chef') === 'food_truck' ? (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: '#3275bd',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          🚚 Food Truck
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: '#4d2f91',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          👨‍🍳 Private Chef
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#3275bd' }}>
                      Est. ${(it.estimatedCostCents / 100).toFixed(2)}
                    </div>
                    {it.notes && <div style={{ fontSize: 14, marginTop: 4 }}>{it.notes}</div>}
                  </li>
                ))}
              </ul>
              <div
                style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: 12,
                  fontFamily: fontStack,
                  fontSize: 18,
                }}
              >
                <div>Estimated subtotal: ${(pkg.estimatedTotalCents / 100).toFixed(2)}</div>
                <div style={{ color: '#4d2f91', fontWeight: 800 }}>Concierge service: Included</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setPkg(null);
                    setBriefId(null);
                    setStatus(null);
                    setConfirmed(false);
                  }}
                  style={{ fontFamily: fontStack, padding: '10px 14px' }}
                >
                  Adjust brief
                </button>
                {!confirmed && (
                  <button
                    type="button"
                    onClick={() => void onAccept()}
                    disabled={loading}
                    style={{
                      padding: '12px 20px',
                      background: '#4d2f91',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontFamily: fontStack,
                      fontWeight: 800,
                    }}
                  >
                    {loading ? 'Confirming…' : 'Confirm package'}
                  </button>
                )}
              </div>
              {confirmed && (
                <p style={{ fontFamily: fontStack, color: '#15803d', marginTop: 16 }}>
                  Package confirmed — we will route booking requests to providers.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
