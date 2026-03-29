import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO, { SITE_URL } from '../components/SEO';
import { fetchTalentDirectory, getTalentById, TALENT_FALLBACK } from '../data/talent';
import type { TalentRecord } from '../types/talentRecord';
import { buildProfessionalServiceStructuredData } from '../lib/seo/professionalServiceJsonLd';

function firstNameFromFullName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0];
  return part || 'this professional';
}

export default function TalentProfile() {
  const { id } = useParams<{ id: string }>();
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

  const hireHref = row ? `/hire?talentId=${encodeURIComponent(row.id)}` : '/hire';
  const bookLabel = row ? `Book ${firstNameFromFullName(row.name)}` : 'Post a project';

  const metaDescription = row
    ? `${row.name} | ${row.specialty} specializing in culinary innovation.`
    : 'Browse verified culinary R&D professionals on Spice Krewe.';

  const showRate = Boolean(row?.rate?.trim());
  const showRating = row != null && row.rating > 0;
  const showReviews = row != null && row.reviews > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={`${displayName} – Spice Krewe`}
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
          ← Back to talent
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
              We couldn&apos;t find that professional. Return to the directory to browse verified talent.
            </p>
            <Link
              to="/talent"
              style={{
                display: 'inline-block',
                minHeight: 44,
                padding: '12px 24px',
                lineHeight: '20px',
                background: 'var(--sk-purple)',
                color: '#fff',
                borderRadius: 'var(--sk-radius-md)',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
            >
              Browse talent
            </Link>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
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
                <p style={{ margin: 0, fontSize: 15, color: 'var(--sk-purple)', fontWeight: 500 }}>{row.role}</p>
              </div>
            </div>

            {row.verified ? (
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--sk-gold)',
                  background: 'rgba(230, 168, 0, 0.14)',
                  border: '1px solid rgba(230, 168, 0, 0.35)',
                  padding: '4px 10px',
                  borderRadius: 'var(--sk-radius-pill)',
                  marginBottom: 16,
                }}
              >
                SK Verified
              </span>
            ) : null}

            <p style={{ color: '#6b5a88', lineHeight: 1.65, marginBottom: 20 }}>{row.bio}</p>

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
              {row.available ? 'Available for new projects' : 'Currently booked — join waitlist via project post'}
            </p>

            <Link
              to={hireHref}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '12px 24px',
                background: 'var(--sk-purple)',
                color: '#fff',
                borderRadius: 'var(--sk-radius-md)',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                boxSizing: 'border-box',
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
