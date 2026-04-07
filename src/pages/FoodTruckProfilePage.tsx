import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { FoodTruckBookingForm } from '../components/FoodTruckBookingForm';
import { useCity } from '../lib/city/useCity';
import {
  checkTruckCapacity,
  fetchFoodTruckProviderRow,
  type FoodTruckSearchResultRow,
} from '../services/foodTruckApi';
import { getObvTier, getCulinaryBadgeLabel } from '../lib/credentials/obvTierService';

const fontStack = '"Barlow Condensed", system-ui, sans-serif';
const primary = '#4d2f91';
const secondary = '#3275bd';

export default function FoodTruckProfilePage() {
  const { providerId } = useParams<{ providerId: string }>();
  const { citySlug } = useCity();

  if (!providerId) {
    return (
      <p style={{ padding: 24, fontFamily: fontStack }} role="alert">
        Missing provider id in URL.
      </p>
    );
  }
  const [row, setRow] = useState<FoodTruckSearchResultRow | null | undefined>(undefined);
  const [cap, setCap] = useState<Awaited<ReturnType<typeof checkTruckCapacity>> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) return;
    let cancelled = false;
    void (async () => {
      try {
        const [profile, capacity] = await Promise.all([
          fetchFoodTruckProviderRow(providerId, citySlug),
          checkTruckCapacity(providerId, 50),
        ]);
        if (cancelled) return;
        setRow(profile);
        setCap(capacity);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed to load');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [providerId, citySlug]);

  const displayName = row?.truck_name || row?.display_name || 'Food truck';
  const cuisines = row?.cuisine_categories ?? [];
  const obi = typeof row?.obi_score === 'number' ? row.obi_score : 0;
  const reviews = typeof row?.review_count === 'number' ? row.review_count : 0;
  const tier = getObvTier(obi, reviews);

  return (
    <>
      <SEO title={`${displayName} — Spice Krewe`} description="Book a verified food truck for your event." />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px', fontFamily: fontStack }}>
        <h1 style={{ color: primary, fontWeight: 800, fontSize: 34, letterSpacing: '0.02em' }}>{displayName}</h1>
        {row?.display_name && row.truck_name && (
          <p style={{ color: secondary, fontSize: 18, marginTop: 0 }}>{row.display_name}</p>
        )}

        {err && <p style={{ color: '#b91c1c' }}>{err}</p>}

        {row === undefined && !err && <p style={{ color: secondary }}>Loading…</p>}
        {row === null && !err && <p>We could not find this truck in {citySlug}. Try another city (use ?city=).</p>}

        {row && cap && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {cuisines.map((c) => (
                <span
                  key={c}
                  style={{
                    background: '#f3f4f6',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 14,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 18 }}>
              <strong>Max capacity:</strong> {cap.max} guests · <strong>Service radius:</strong> {cap.serviceRadius}
            </p>
            {row.health_permit_verified && (
              <p
                style={{
                  display: 'inline-block',
                  marginTop: 8,
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: '#ecfdf5',
                  color: '#047857',
                  fontWeight: 700,
                }}
              >
                Health permit verified
              </p>
            )}
            {row.is_verified && (
              <p
                style={{
                  display: 'inline-block',
                  marginLeft: 8,
                  marginTop: 8,
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: '#eef2ff',
                  color: primary,
                  fontWeight: 700,
                }}
              >
                SpiceKrewe Verified — {getCulinaryBadgeLabel(tier.tier)} tier
              </p>
            )}

            <h2 style={{ color: primary, marginTop: 28 }}>Book this truck</h2>
            <FoodTruckBookingForm providerId={providerId} citySlug={citySlug} />
          </>
        )}
      </div>
    </>
  );
}
