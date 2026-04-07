/**
 * City selector — persistent header element.
 * Shows current city with dropdown when multiple live cities are available.
 * Single city: shows name only, no dropdown.
 */

import { useState } from 'react';
import { useCity } from '../context/CityContext';

export function CitySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { citySlug, cityDisplayName, cityStateCode, setCity, availableCities, isLoadingCities } = useCity();

  const liveCities = availableCities.filter((c) => c.isLive);
  const hasMultipleCities = liveCities.length > 1;

  if (isLoadingCities) {
    return (
      <span style={{ color: '#4d2f91' }} aria-live="polite">
        📍 Loading...
      </span>
    );
  }

  if (!hasMultipleCities) {
    return (
      <span
        style={{
          color: '#4d2f91',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 600,
        }}
      >
        📍 {cityDisplayName}, {cityStateCode}
      </span>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{
          color: '#4d2f91',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 600,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
        }}
        onClick={() => setIsOpen((o) => !o)}
      >
        📍 {cityDisplayName}, {cityStateCode} ▾
      </button>

      {isOpen ? (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: 'white',
            border: '1px solid #4d2f91',
            borderRadius: 8,
            minWidth: 180,
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {availableCities.map((c) => (
            <div
              key={c.slug}
              role="option"
              aria-selected={c.slug === citySlug}
              onClick={() => {
                if (c.isLive) {
                  setCity(c.slug, c.displayName, c.stateCode);
                  setIsOpen(false);
                }
              }}
              onKeyDown={(e) => {
                if (c.isLive && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  setCity(c.slug, c.displayName, c.stateCode);
                  setIsOpen(false);
                }
              }}
              style={{
                padding: '10px 16px',
                cursor: c.isLive ? 'pointer' : 'default',
                opacity: c.isLive ? 1 : 0.4,
                fontFamily: 'Barlow Condensed, sans-serif',
                color: c.isLive ? '#4d2f91' : '#999',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              {c.displayName}, {c.stateCode}
              {!c.isLive ? (
                <span style={{ fontSize: '0.7em', marginLeft: 6, color: '#3275bd' }}>Coming soon</span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
