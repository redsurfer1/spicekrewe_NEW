import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Lock, Eye, EyeOff, Map } from 'lucide-react';
import {
  ADMIN_TOKEN_KEY,
  readAdminToken,
  isAdminMfaVerified,
  clearAdminSession,
} from '../lib/adminSession';

function apiPath(p: string): string {
  const base = import.meta.env.VITE_APP_ORIGIN?.replace(/\/$/, '') ?? '';
  return `${base}${p}`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return Boolean(readAdminToken() && isAdminMfaVerified());
  });
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const { showMap, setShowMap } = useApp();

  useEffect(() => {
    const t = readAdminToken();
    if (!t) {
      setIsAuthenticated(false);
      return;
    }
    if (!isAdminMfaVerified()) {
      navigate('/admin/mfa-verify', { replace: true });
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');
    try {
      const res = await fetch(apiPath('/api/admin/session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json().catch(() => null)) as {
        token?: string;
        error?: string;
        role?: string;
        mfaRequired?: boolean;
      };
      if (!res.ok) {
        setError(json?.error || 'Login failed');
        setPassword('');
        return;
      }
      if (json?.token) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, json.token);
        setPassword('');
        navigate('/admin/mfa-verify', { replace: true });
      } else {
        setError('Invalid server response');
      }
    } catch {
      setError('Could not reach admin session API. Is the server deployed?');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
  };

  const handleToggle = () => {
    setShowMap(!showMap);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white border border-sk-card-border rounded-sk-md shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-spice-purple/10 p-4 rounded-full">
              <Lock className="w-8 h-8 text-spice-purple" aria-hidden />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Super-Admin password (server-verified). MFA step follows (Flomisma Gold G5).
          </p>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spice-purple focus:border-transparent transition"
                placeholder="Enter admin password"
                autoFocus
                disabled={loginLoading}
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-sk-card-border rounded-sk-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-spice-purple text-white py-3 rounded-lg font-semibold hover:bg-spice-purple/90 transition disabled:opacity-50"
            >
              {loginLoading ? 'Signing in…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-sk-card-border rounded-sk-md shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-spice-purple to-spice-blue p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-white/90">
              Manage site visibility settings
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 rounded-sk-md border border-sk-card-border bg-gray-50 p-4">
              <p className="text-sm text-gray-700 mb-2">
                <Link to="/admin/health" className="font-semibold text-spice-purple hover:underline">
                  System health dashboard
                </Link>{' '}
                — Supabase connectivity, Stripe webhooks, recent brief syncs (obfuscated).
              </p>
            </div>

            <div className="bg-gray-50 rounded-sk-md p-6 border border-sk-card-border">
              <div className="flex items-start gap-4">
                <div className="bg-spice-purple/10 p-3 rounded-lg">
                  <Map className="w-6 h-6 text-spice-purple" aria-hidden />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Map Component Visibility
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Control whether the "Find Spice Krewe" map section is displayed on the main website.
                  </p>
                  <div className="bg-blue-50 border border-sk-card-border rounded-sk-md p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Early Phase Note:</strong> The map is hidden by default during the early launch phase.
                      Toggle it on when you're ready to display location information to visitors.
                    </p>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-sk-md p-4 border border-sk-card-border">
                    <div className="flex items-center gap-3">
                      {showMap ? (
                        <>
                          <Eye className="w-5 h-5 text-green-600" aria-hidden />
                          <span className="font-semibold text-gray-900">Map is Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-5 h-5 text-gray-400" aria-hidden />
                          <span className="font-semibold text-gray-900">Map is Hidden</span>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleToggle}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-spice-purple focus:ring-offset-2 ${
                        showMap ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          showMap ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Current status: <strong className={showMap ? 'text-green-600' : 'text-gray-600'}>
                        {showMap ? 'Map section is displayed to visitors' : 'Map section is hidden from visitors'}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <a
                href="/"
                className="text-spice-purple hover:text-spice-purple/80 font-semibold transition"
              >
                ← Back to Website
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
