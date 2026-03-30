import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { ADMIN_TOKEN_KEY, isAdminMfaVerified, setAdminMfaVerified } from '../../lib/adminSession';
import SEO from '../../components/SEO';

/**
 * G5: Super-Admin MFA gate (stub). Production: replace with Supabase Auth MFA / `aal` verification
 * and set session_mfa_verified from the IdP response — do not trust client-only flags alone.
 */
export default function AdminMfaVerify() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(ADMIN_TOKEN_KEY) : null;
    if (!token) {
      navigate('/admin', { replace: true });
      return;
    }
    if (isAdminMfaVerified()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const confirmStub = () => {
    setAdminMfaVerified();
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <SEO title="Admin MFA – Spice Krewe" path="/admin/mfa-verify" />
      <div className="bg-white border border-sk-card-border rounded-sk-md shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-spice-purple/10 p-4 rounded-full">
            <Shield className="w-8 h-8 text-spice-purple" aria-hidden />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Super-Admin verification</h1>
        <p className="text-gray-600 text-center mb-6 text-sm">
          Flomisma Gold policy requires MFA for <code className="text-xs bg-gray-100 px-1 rounded">/admin/*</code>.
          This step stubs Supabase Auth MFA integration: confirm to continue.
        </p>
        <button
          type="button"
          onClick={confirmStub}
          className="w-full bg-spice-purple text-white py-3 rounded-lg font-semibold hover:bg-spice-purple/90 transition"
        >
          Confirm MFA (stub — wire Supabase Auth MFA)
        </button>
        <p className="mt-4 text-center">
          <Link to="/admin" className="text-sm text-spice-purple hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
