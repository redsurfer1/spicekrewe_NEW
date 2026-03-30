import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getSupabaseBrowserOptional } from '../lib/supabase';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SpiceKreweWordmark from '../components/SpiceKreweWordmark';
import SEO from '../components/SEO';
import { useAuth } from '../hooks/useAuth';

type Tab = 'signin' | 'register';
type Role = 'buyer' | 'talent';

export default function LoginPage() {
  const location = useLocation();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const supabase = getSupabaseBrowserOptional();
  const { user } = useAuth();

  useEffect(() => {
    if (location.state?.defaultTab === 'register') {
      setTab('register');
    }
  }, [location.state]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Authentication is not available');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Incorrect email or password. Please try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please confirm your email before signing in.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        const userRole = profileData?.role || 'buyer';

        if (userRole === 'admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Authentication is not available');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setSuccess('Account created! Check your email to confirm your account before signing in.');
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!supabase || !email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess('Check your email for a reset link.');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Sign in — Spice Krewe"
        description="Sign in to manage your culinary talent bookings, projects, and professional profile."
        path="/login"
      />
      <Navigation />
      <main className="min-h-screen bg-sk-body-bg py-16">
        <div className="max-w-[420px] mx-auto px-4">
          <div className="bg-white border border-sk-card-border rounded-sk-lg p-8 shadow-sm">
            <div className="flex justify-center">
              <SpiceKreweWordmark className="w-32" />
            </div>

            <h1 className="text-2xl font-medium text-sk-navy mt-4 mb-1 text-center">
              Welcome back
            </h1>
            <p className="text-sm text-sk-text-muted text-center">
              Sign in to your Spice Krewe account
            </p>

            <div className="bg-sk-body-bg rounded-sk-md p-1 mt-6 flex gap-1">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`flex-1 text-sm font-medium py-2 rounded-sk-md transition ${
                  tab === 'signin'
                    ? 'bg-sk-purple text-white'
                    : 'text-sk-text-muted'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`flex-1 text-sm font-medium py-2 rounded-sk-md transition ${
                  tab === 'register'
                    ? 'bg-sk-purple text-white'
                    : 'text-sk-text-muted'
                }`}
              >
                Create account
              </button>
            </div>

            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-sk-navy mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-sk-card-border rounded-sk-md px-3 py-2 text-sm focus:outline-none focus:border-sk-purple focus:ring-1 focus:ring-sk-purple"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-sk-navy mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-sk-card-border rounded-sk-md px-3 py-2 text-sm focus:outline-none focus:border-sk-purple focus:ring-1 focus:ring-sk-purple"
                  />
                  <div className="text-right mt-1">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-sk-purple underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-xs">{error}</p>
                )}

                {success && (
                  <p className="text-green-600 text-xs">{success}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full bg-sk-purple text-white py-2.5 rounded-sk-md text-sm font-medium hover:bg-[#3d2472] transition disabled:opacity-50"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-sk-navy mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    required
                    autoComplete="name"
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-sk-card-border rounded-sk-md px-3 py-2 text-sm focus:outline-none focus:border-sk-purple focus:ring-1 focus:ring-sk-purple"
                  />
                </div>

                <div>
                  <label htmlFor="email-register" className="block text-sm font-medium text-sk-navy mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email-register"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-sk-card-border rounded-sk-md px-3 py-2 text-sm focus:outline-none focus:border-sk-purple focus:ring-1 focus:ring-sk-purple"
                  />
                </div>

                <div>
                  <label htmlFor="password-register" className="block text-sm font-medium text-sk-navy mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password-register"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-sk-card-border rounded-sk-md px-3 py-2 text-sm focus:outline-none focus:border-sk-purple focus:ring-1 focus:ring-sk-purple"
                  />
                  <p className="text-xs text-sk-text-muted mt-1">At least 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sk-navy mb-2">
                    I am
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setRole('buyer')}
                      className={`rounded-sk-lg p-3 cursor-pointer transition ${
                        role === 'buyer'
                          ? 'border-2 border-sk-purple bg-[#f4f1fe]'
                          : 'border border-sk-card-border'
                      }`}
                    >
                      <p className="text-sm font-medium text-sk-navy">I want to hire talent</p>
                      <p className="text-xs text-sk-text-muted mt-1">
                        Post briefs and book vetted professionals
                      </p>
                    </div>

                    <div
                      onClick={() => setRole('talent')}
                      className={`rounded-sk-lg p-3 cursor-pointer transition ${
                        role === 'talent'
                          ? 'border-2 border-sk-purple bg-[#f4f1fe]'
                          : 'border border-sk-card-border'
                      }`}
                    >
                      <p className="text-sm font-medium text-sk-navy">I'm a culinary professional</p>
                      <p className="text-xs text-sk-text-muted mt-1">
                        Get matched with clients and grow your freelance career
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-xs">{error}</p>
                )}

                {success && (
                  <p className="text-green-600 text-xs">{success}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full bg-sk-purple text-white py-2.5 rounded-sk-md text-sm font-medium hover:bg-[#3d2472] transition disabled:opacity-50"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 text-center space-y-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-sk-card-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-sk-body-bg px-2 text-sk-text-muted">or</span>
              </div>
            </div>

            <p className="text-sm text-sk-text-muted mt-4">
              Hiring for a team or brand?{' '}
              <Link to="/for-teams" className="text-sk-purple underline">
                Learn more
              </Link>
            </p>

            <p className="text-sm text-sk-text-muted">
              Want to join as a culinary pro?{' '}
              <Link to="/join" className="text-sk-purple underline">
                Apply now
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
