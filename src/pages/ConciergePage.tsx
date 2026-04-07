import { Link } from 'react-router-dom';
import { ConciergeForm } from '../components/ConciergeForm';
import SEO from '../components/SEO';
import { useAuth } from '../lib/auth/useAuth';
import { useCity } from '../context/CityContext';

export default function ConciergePage() {
  const { citySlug, cityDisplayName } = useCity();
  const { buyerId, loading } = useAuth();

  return (
    <>
      <SEO
        title={`Plan an event in ${cityDisplayName} — SpiceKrewe`}
        description="Tell us about your event — our free AI concierge helps you choose a private chef, food truck, or both."
      />
      {loading ? (
        <p style={{ padding: 16 }}>Checking your session…</p>
      ) : !buyerId ? (
        <div style={{ padding: 16, background: '#fff7ed', color: '#9a3412', maxWidth: 560 }}>
          <p style={{ margin: '0 0 8px' }}>
            Sign in so we can attach your concierge brief to your SpiceKrewe buyer profile.
          </p>
          <Link to="/login" style={{ fontWeight: 700, color: '#4d2f91' }}>
            Sign in or create an account
          </Link>
          <p style={{ marginTop: 12, fontSize: 13, marginBottom: 0 }}>
            Operators: optional fallback <code>VITE_CONCIERGE_DEMO_BUYER_ID</code> is ignored when a session is
            present; for CI-only demos set a buyer id in your profile <code>external_user_id</code> column when it
            differs from Supabase auth id.
          </p>
        </div>
      ) : (
        <ConciergeForm citySlug={citySlug} cityDisplayName={cityDisplayName} buyerId={buyerId} />
      )}
    </>
  );
}
