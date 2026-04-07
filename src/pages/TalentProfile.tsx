import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO, { SITE_URL } from '../components/SEO';
import { fetchTalentDirectory, getTalentById, TALENT_FALLBACK } from '../data/talent';
import type { TalentRecord } from '../types/talentRecord';
import { buildProfessionalServiceStructuredData } from '../lib/seo/professionalServiceJsonLd';
import { useCity } from '../context/CityContext';
import { getCulinaryBadgeLabel, getObvTier } from '../lib/credentials/obvTierService';

const fontBarlow = '"Barlow Condensed", system-ui, sans-serif';
const primaryPurple = '#4d2f91';

function firstNameFromFullName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0];
  return part || 'this provider';
}

function typeHeadline(row: TalentRecord, cityDisplayName: string, stateCode: string) {
  const loc = `${cityDisplayName}, ${stateCode}`;
  if (row.providerType === 'food_truck') return `Food Truck · ${loc}`;
  return `Private Chef · ${loc}`;
}

export default function TalentProfile() {
  const { id } = useParams<{ id: string }>();
  const { cityDisplayName, cityStateCode } = useCity();
  const [roster, setRoster] = useState<TalentRecord[]>(() => [...TALENT_FALLBACK]);

  useEffect(() => {
    let cancelled = false;
    fetchTalentDirectory().then((list) => {
      if (!cancelled) setRoster(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const result = id ? getTalentById(id, roster) : { success: false as const, error: 'PROFESSIONAL_NOT_FOUND' as const };
  const row = result.success ? result.data : undefined;
  const displayName = row?.name ?? 'Professional';
  const structuredData =
    result.success ? buildProfessionalServiceStructuredData(result.data, SITE_URL) : undefined;

  const isTruck = row?.providerType === 'food_truck';
  const bookHref = row
    ? isTruck
      ? `/food-trucks/${encodeURIComponent(row.id)}`
      : `/hire?talentId=${encodeURIComponent(row.id)}`
    : '/hire';
  const bookLabel = row ? `Book ${firstNameFromFullName(row.name)}` : 'Plan an event';

  const metaDescription = row
    ? `${row.name} — ${row.specialty}. Book verified private events in ${cityDisplayName} on SpiceKrewe.`
    : 'Browse verified private chefs and food trucks on SpiceKrewe.';

  const showRate = Boolean(row?.rate?.trim());
  const showRating = row != null && row.rating > 0;
  const showReviews = row != null && row.reviews > 0;

  const obvScore = row ? row.obvScore ?? row.rating * 20 : 0;
  const engagement = row?.reviews ?? 0;
  const tierInfo = row ? getObvTier(obvScore, engagement) : null;
  const tierLabel = tierInfo ? getCulinaryBadgeLabel(tierInfo.tier) : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={`${displayName} – SpiceKrewe`}
        path={id ? `/talent/${id}` : '/talent'}
        description={metaDescription}
        ogDescription={metaDescription}
        structuredData={structuredData}
      />
      <Navbar />
      <main
        className="px-4 sm:px-8"
        style={{
          flex: 1,
          paddingTop: 40,
          paddingBottom: 48,
          maxWidth: 640,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Link
          to="/talent"
          style={{ fontSize: 13, color: 'var(--sk-purple)', textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}
        >
          ← Back to directory
        </Link>

        {!row ? (
          <>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: 'var(--sk-navy)',
                marginBottom: 12,
              }}
            >
              Profile not found
            </h1>
            <p style={{ color: '#6b5a88', lineHeight: 1.6, marginBottom: 24 }}>
              We couldn&apos;t find that provider. Return to browse verified chefs and food trucks.
            </p>
            <Link
              to="/talent"
              style={{
                display: 'inline-block',
                minHeight: 44,
                padding: '12px 24px',
                lineHeight: '20px',
                background: primaryPurple,
                color: '#fff',
                borderRadius: 'var(--sk-radius-md)',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                boxSizing: 'border-box',
                fontFamily: fontBarlow,
              }}
            >
              Browse chefs &amp; trucks
            </Link>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 'var(--sk-radius-lg)',
                  background: row.avatarColor,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                }}
                aria-hidden
              >
                {row.avatarText}
              </div>
              <div>
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: 'var(--sk-navy)',
                    margin: '0 0 4px 0',
                  }}
                >
                  {row.name}
                </h1>
                <p style={{ margin: '0 0 6px 0', fontSize: 15, color: primaryPurple, fontWeight: 600, fontFamily: fontBarlow }}>
                  {typeHeadline(row, cityDisplayName, cityStateCode)}
                </p>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--sk-text-muted)', fontWeight: 500 }}>{row.role}</p>
              </div>
            </div>

            {row.verified ? (
              <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: '#fff',
                    background: primaryPurple,
                    padding: '6px 12px',
                    borderRadius: 'var(--sk-radius-pill)',
                    fontFamily: fontBarlow,
                  }}
                >
                  ✓ SpiceKrewe Verified
                </span>
                {tierLabel ? (
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sk-navy)' }}>OBV: {tierLabel}</span>
                ) : null}
              </div>
            ) : null}

            <p style={{ color: '#6b5a88', lineHeight: 1.65, marginBottom: 20 }}>{row.bio}</p>

            <p style={{ fontSize: 14, color: 'var(--sk-navy)', marginBottom: 20, lineHeight: 1.55 }}>
              Available for private events, dinners, and celebrations in the {cityDisplayName} area.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {row.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 12,
                    padding: '4px 12px',
                    borderRadius: 'var(--sk-radius-pill)',
                    border: '1px solid rgba(77, 47, 145, 0.2)',
                    color: 'var(--sk-purple)',
                    background: 'var(--sk-purple-light)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {showRate || showRating || showReviews ? (
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--sk-navy)', marginBottom: 8 }}>
                {showRate ? <span>{row.rate}</span> : null}
                {showRate && (showRating || showReviews) ? <span> · </span> : null}
                {showRating ? (
                  <span>
                    ★ {row.rating.toFixed(1)}
                    {showReviews ? ` (${row.reviews} reviews)` : null}
                  </span>
                ) : showReviews ? (
                  <span>({row.reviews} reviews)</span>
                ) : null}
              </p>
            ) : null}

            <p style={{ fontSize: 14, color: row.available ? '#2d6a4f' : '#9a6b2e', marginBottom: 24, fontWeight: 600 }}>
              {row.available ? 'Open for new event bookings' : 'Limited availability — request dates via booking'}
            </p>

            <Link
              to={bookHref}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '12px 24px',
                background: primaryPurple,
                color: '#fff',
                borderRadius: 'var(--sk-radius-md)',
                fontSize: 16,
                fontWeight: 700,
                textDecoration: 'none',
                boxSizing: 'border-box',
                fontFamily: fontBarlow,
                letterSpacing: '0.02em',
              }}
            >
              {bookLabel}
            </Link>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
