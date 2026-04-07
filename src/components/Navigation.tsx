import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SpiceKreweWordmark from './SpiceKreweWordmark';
import { CitySelector } from './CitySelector';

const primaryLinks: { to: string; label: string }[] = [
  { to: '/talent?type=private_chef', label: 'Private Chefs' },
  { to: '/talent?type=food_truck', label: 'Food Trucks' },
  { to: '/concierge', label: 'Plan an Event' },
];

const secondaryLinks: { to: string; label: string }[] = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about', label: 'About' },
];

const linkClass =
  'text-sm font-medium text-sk-purple-light no-underline hover:opacity-90 transition-opacity';

/**
 * Spice Krewe shell — narrow model: private chefs, food trucks, concierge (Memphis-first).
 */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="sticky top-0 z-[100] border-b border-sk-purple-light/20 bg-sk-navy backdrop-blur-md">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8 min-h-[56px]">
        <div className="z-[2] flex shrink-0 items-center gap-3 sm:gap-4">
          <Link
            to="/"
            className="no-underline flex items-center min-h-[44px]"
            aria-label="Spice Krewe home"
          >
            <SpiceKreweWordmark className="h-7 shrink-0 sm:h-8" />
          </Link>
          <div className="hidden min-h-[44px] items-center sm:flex">
            <CitySelector />
          </div>
        </div>

        {/* Desktop center links */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 justify-center lg:flex">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {primaryLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={linkClass}>
                {label}
              </Link>
            ))}
            <span className="hidden xl:inline h-4 w-px bg-sk-purple-light/30" aria-hidden />
            {secondaryLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={linkClass}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="z-10 ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="hidden min-h-[44px] items-center rounded-sk-sm border border-sk-purple-light/40 px-4 py-2.5 text-[13px] text-sk-purple-light no-underline sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/hire"
            className="inline-flex min-h-[44px] items-center rounded-sk-sm px-4 py-2.5 text-[13px] font-bold text-white no-underline shadow-md"
            style={{ backgroundColor: '#4d2f91', fontFamily: '"Barlow Condensed", system-ui, sans-serif' }}
          >
            Book now
          </Link>

          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-sk-purple-light/35 bg-sk-purple/35 text-white lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="sk-mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X size={22} className="text-white" strokeWidth={2} aria-hidden />
            ) : (
              <Menu size={22} className="text-white" strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>
      </nav>

      {mobileOpen ? (
        <div
          id="sk-mobile-nav"
          className="border-t border-sk-purple-light/15 bg-sk-navy px-4 pb-5 pt-3 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <div className="px-3 py-2">
              <CitySelector />
            </div>
            {primaryLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-sk-md px-3 py-3.5 ${linkClass}`}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/join"
              onClick={() => setMobileOpen(false)}
              className={`rounded-sk-md px-3 py-3.5 ${linkClass}`}
            >
              Join as a provider
            </Link>
            {secondaryLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-sk-md px-3 py-3.5 ${linkClass}`}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-sk-md border border-sk-purple-light/35 px-3 py-3.5 text-sm font-semibold text-sk-purple-light no-underline"
            >
              Sign in
            </Link>
            <Link
              to="/hire"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-sk-sm px-4 py-2.5 text-[13px] font-bold text-white no-underline shadow-md"
              style={{ backgroundColor: '#4d2f91', fontFamily: '"Barlow Condensed", system-ui, sans-serif' }}
            >
              Book now
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
