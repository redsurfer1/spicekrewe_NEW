import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import SpiceKreweWordmark from '../../components/SpiceKreweWordmark';
import { LayoutDashboard, Briefcase, Heart, CreditCard, Settings, User, DollarSign, ChevronLeft } from 'lucide-react';

export default function UserDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, role, signOut } = useAuth();
  const tab = searchParams.get('tab') || 'overview';

  const setTab = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  const getInitials = () => {
    const name = profile?.display_name || profile?.full_name || user?.email || '';
    return name.charAt(0).toUpperCase();
  };

  const renderTopBar = () => (
    <div className="bg-sk-navy h-14 flex items-center px-6 justify-between">
      <Link to="/">
        <SpiceKreweWordmark className="w-24 text-white" />
      </Link>
      <div className="w-10 h-10 rounded-full bg-sk-purple text-white text-sm font-medium flex items-center justify-center">
        {getInitials()}
      </div>
    </div>
  );

  const renderSidebar = () => {
    const buyerNavItems = [
      { icon: LayoutDashboard, label: 'Overview', tab: 'overview' },
      { icon: Briefcase, label: 'My projects', tab: 'projects' },
      { icon: Heart, label: 'Saved talent', tab: 'saved' },
      { icon: CreditCard, label: 'Billing', tab: 'billing' },
      { icon: Settings, label: 'Settings', tab: 'settings' },
    ];

    const talentNavItems = [
      { icon: LayoutDashboard, label: 'Overview', tab: 'overview' },
      { icon: Briefcase, label: 'My projects', tab: 'projects' },
      { icon: User, label: 'My profile', tab: 'profile' },
      { icon: DollarSign, label: 'Earnings', tab: 'earnings' },
      { icon: Settings, label: 'Settings', tab: 'settings' },
    ];

    const navItems = role === 'talent' ? talentNavItems : buyerNavItems;

    return (
      <aside className="bg-white border-r border-sk-card-border flex flex-col h-full overflow-y-auto w-60">
        <div className="p-4 border-b border-sk-card-border">
          <div className="w-12 h-12 rounded-full bg-sk-purple text-white text-lg font-medium flex items-center justify-center">
            {getInitials()}
          </div>
          <p className="text-sm font-medium text-sk-navy mt-2">
            {profile?.display_name || profile?.full_name || 'User'}
          </p>
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
              role === 'buyer'
                ? 'bg-blue-50 text-sk-blue'
                : 'bg-[#fef8e7] text-[#8a6200]'
            }`}
          >
            {role === 'buyer' ? 'Buyer' : 'SK Professional'}
            {role === 'talent' && profile?.sk_verified && ' ✓'}
          </span>
        </div>

        <nav className="flex-1 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.tab;

            return (
              <button
                key={item.tab}
                onClick={() => setTab(item.tab)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer transition ${
                  isActive
                    ? 'bg-sk-body-bg border-l-2 border-sk-purple text-sk-purple font-medium'
                    : 'text-sk-text-muted hover:bg-sk-body-bg hover:text-sk-navy'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sk-card-border">
          <Link to="/" className="block text-xs text-sk-text-muted hover:text-sk-purple">
            <ChevronLeft size={12} className="inline" /> Back to site
          </Link>
          <button
            onClick={signOut}
            className="block text-xs text-red-500 mt-1 hover:text-red-700"
          >
            Sign out
          </button>
        </div>
      </aside>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {renderTopBar()}

      <div className="flex flex-row flex-1 h-[calc(100vh-56px)]">
        {renderSidebar()}

        <main className="flex-1 overflow-y-auto bg-sk-body-bg">
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-medium text-sk-navy mb-4">
              {tab === 'overview' && 'Overview'}
              {tab === 'projects' && 'Projects'}
              {tab === 'saved' && 'Saved Talent'}
              {tab === 'billing' && 'Billing'}
              {tab === 'profile' && 'My Profile'}
              {tab === 'earnings' && 'Earnings'}
              {tab === 'settings' && 'Settings'}
            </h1>

            {tab === 'overview' && (
              <div>
                <p className="text-sm text-sk-text-muted mb-6">
                  Welcome to your dashboard, {profile?.display_name || 'there'}!
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-sk-lg border border-sk-card-border p-4">
                    <p className="text-xs text-sk-text-muted mb-1">Active projects</p>
                    <p className="text-2xl font-medium text-sk-navy">0</p>
                  </div>
                  <div className="bg-white rounded-sk-lg border border-sk-card-border p-4">
                    <p className="text-xs text-sk-text-muted mb-1">
                      {role === 'buyer' ? 'Talent booked' : 'Completed'}
                    </p>
                    <p className="text-2xl font-medium text-sk-navy">0</p>
                  </div>
                  <div className="bg-white rounded-sk-lg border border-sk-card-border p-4">
                    <p className="text-xs text-sk-text-muted mb-1">
                      {role === 'buyer' ? 'Total spent' : 'Total earned'}
                    </p>
                    <p className="text-2xl font-medium text-sk-navy">$0</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {role === 'buyer' ? (
                    <>
                      <Link
                        to="/hire"
                        className="bg-sk-purple text-white px-4 py-2 rounded-sk-md text-sm font-medium hover:bg-[#3d2472] transition"
                      >
                        Post a new project
                      </Link>
                      <Link
                        to="/talent"
                        className="border border-sk-card-border px-4 py-2 rounded-sk-md text-sm hover:bg-white transition"
                      >
                        Browse talent
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setTab('profile')}
                        className="bg-sk-purple text-white px-4 py-2 rounded-sk-md text-sm font-medium hover:bg-[#3d2472] transition"
                      >
                        Edit my profile
                      </button>
                      <Link
                        to={`/talent/${profile?.slug || ''}`}
                        className="border border-sk-card-border px-4 py-2 rounded-sk-md text-sm hover:bg-white transition"
                      >
                        View public profile
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}

            {tab !== 'overview' && (
              <div className="bg-white rounded-sk-lg border border-sk-card-border p-8 text-center">
                <p className="text-sk-text-muted">This section is coming soon.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
