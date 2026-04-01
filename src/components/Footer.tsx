import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import SpiceKreweWordmark from './SpiceKreweWordmark';

const linkMuted: CSSProperties = {
  color: 'rgba(255,255,255,0.72)',
  textDecoration: 'none',
  fontSize: 14,
};
const linkHoverClass = 'hover:opacity-100 transition-opacity';

const headingClass = 'mb-4 text-sm font-bold tracking-normal text-[#6b5a88]';

export default function Footer() {
  return (
    <footer
      className="py-12"
      style={{
        background: 'var(--sk-navy)',
        color: '#fff',
        borderTop: '1px solid rgba(185, 158, 232, 0.2)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="mb-4 flex flex-col items-start gap-0">
              <span className="sr-only">Spice Krewe</span>
              <SpiceKreweWordmark className="h-9 w-auto max-w-[min(100%,280px)] sm:h-10" />
            </div>
            <p className="mb-6 max-w-md" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, fontSize: 15 }}>
              Community · Culture · Culinary talent
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-3 rounded-full transition-colors duration-200 hover:bg-white/10"
                style={{ background: 'rgba(77, 47, 145, 0.45)' }}
                aria-label="Facebook"
              >
                <Facebook size={20} className="text-white" aria-hidden />
              </a>
              <a
                href="#"
                className="p-3 rounded-full transition-colors duration-200 hover:bg-white/10"
                style={{ background: 'rgba(77, 47, 145, 0.45)' }}
                aria-label="Instagram"
              >
                <Instagram size={20} className="text-white" />
              </a>
              <a
                href="#"
                className="p-3 rounded-full transition-colors duration-200 hover:bg-white/10"
                style={{ background: 'rgba(77, 47, 145, 0.45)' }}
                aria-label="Twitter"
              >
                <Twitter size={20} className="text-white" aria-hidden />
              </a>
              <a
                href="#"
                className="p-3 rounded-full transition-colors duration-200 hover:bg-white/10"
                style={{ background: 'rgba(77, 47, 145, 0.45)' }}
                aria-label="Youtube"
              >
                <Youtube size={20} className="text-white" aria-hidden />
              </a>
            </div>
          </div>

          <div>
            <h3 className={headingClass}>Marketplace</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/talent" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  Find talent
                </Link>
              </li>
              <li>
                <Link to="/hire" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  Post a project
                </Link>
              </li>
              <li>
                <Link to="/for-teams" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  For teams
                </Link>
              </li>
              <li>
                <Link to="/join" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  Join as a professional
                </Link>
              </li>
              <li>
                <Link to="/guides/pricing-2025" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  2025 service rates
                </Link>
              </li>
              <li>
                <Link to="/hire/recipe-developer" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  Hire recipe developer
                </Link>
              </li>
              <li>
                <Link to="/hire/food-stylist" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  Hire food stylist
                </Link>
              </li>
              <li>
                <Link to="/hire/culinary-consultant" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  Hire culinary consultant
                </Link>
              </li>
              <li>
                <Link to="/hire/memphis" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  Memphis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/contact#message" className={`opacity-90 ${linkHoverClass}`} style={linkMuted}>
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            2025 Spice Krewe
          </p>
          <div className="flex gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/data-request" className="hover:text-white transition-colors">
              Data request
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
