/**
 * CityContext — selected city state for the SpiceKrewe app.
 *
 * Memphis, TN is the default city.
 * All existing flows default to Memphis when no city is selected — this is
 * additive, not a breaking change.
 *
 * Persistence priority:
 * 1. localStorage key 'sk_city_slug' (set when user explicitly picks a city)
 * 2. URL ?city= param (read-only, sets context but does not persist)
 * 3. Default: 'memphis' / 'Memphis' / 'TN'
 *
 * Geolocation auto-detect: not implemented.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface SpiceKreweCity {
  id: string;
  slug: string;
  displayName: string;
  stateCode: string;
  isLive: boolean;
  tagline?: string;
  heroImageUrl?: string;
}

export interface CityContextValue {
  citySlug: string;
  cityDisplayName: string;
  cityStateCode: string;
  setCity: (slug: string, displayName: string, stateCode: string) => void;
  availableCities: SpiceKreweCity[];
  isLoadingCities: boolean;
}

const CITY_SLUG_KEY = 'sk_city_slug';
const CITY_NAME_KEY = 'sk_city_name';
const CITY_STATE_KEY = 'sk_city_state';

function readUrlCitySlugFromWindow(): string | null {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search).get('city')?.trim();
  return q ? q.toLowerCase() : null;
}

function initialSlugFromStorageOrUrl(): string {
  if (typeof window === 'undefined') return 'memphis';
  const stored = localStorage.getItem(CITY_SLUG_KEY)?.trim().toLowerCase();
  if (stored) return stored;
  return readUrlCitySlugFromWindow() ?? 'memphis';
}

function initialDisplayNameFromStorage(): string {
  if (typeof window === 'undefined') return 'Memphis';
  return localStorage.getItem(CITY_NAME_KEY) ?? 'Memphis';
}

function initialStateCodeFromStorage(): string {
  if (typeof window === 'undefined') return 'TN';
  return localStorage.getItem(CITY_STATE_KEY) ?? 'TN';
}

const CityContext = createContext<CityContextValue>({
  citySlug: 'memphis',
  cityDisplayName: 'Memphis',
  cityStateCode: 'TN',
  setCity: () => {},
  availableCities: [],
  isLoadingCities: false,
});

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();

  const [citySlug, setCitySlug] = useState(initialSlugFromStorageOrUrl);
  const [cityDisplayName, setCityDisplayName] = useState(initialDisplayNameFromStorage);
  const [cityStateCode, setCityStateCode] = useState(initialStateCodeFromStorage);
  const [availableCities, setAvailableCities] = useState<SpiceKreweCity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  const setCity = useCallback((slug: string, displayName: string, stateCode: string) => {
    const s = slug.trim().toLowerCase();
    setCitySlug(s);
    setCityDisplayName(displayName);
    setCityStateCode(stateCode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CITY_SLUG_KEY, s);
      localStorage.setItem(CITY_NAME_KEY, displayName);
      localStorage.setItem(CITY_STATE_KEY, stateCode);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const r = await fetch('/api/cities');
        if (!r.ok) throw new Error(String(r.status));
        const data = (await r.json()) as { cities?: Record<string, unknown>[] };
        if (cancelled) return;

        const rows = Array.isArray(data.cities) ? data.cities : [];
        const mapped: SpiceKreweCity[] = rows.map((c) => ({
          id: String(c.id ?? ''),
          slug: String(c.slug ?? '').toLowerCase(),
          displayName: String(c.display_name ?? c.slug ?? ''),
          stateCode: String(c.state_code ?? ''),
          isLive: Boolean(c.is_live),
          tagline: typeof c.tagline === 'string' ? c.tagline : undefined,
          heroImageUrl: typeof c.hero_image_url === 'string' ? c.hero_image_url : undefined,
        }));

        setAvailableCities(mapped);
      } catch {
        /* cities fetch failed — defaults hold */
      } finally {
        if (!cancelled) setIsLoadingCities(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (availableCities.length === 0) return;
    const q = searchParams.get('city')?.trim().toLowerCase();
    if (!q) return;
    const match = availableCities.find((c) => c.slug === q && c.isLive);
    if (!match) return;
    setCitySlug(match.slug);
    setCityDisplayName(match.displayName);
    setCityStateCode(match.stateCode);
  }, [searchParams, availableCities]);

  const value = useMemo<CityContextValue>(
    () => ({
      citySlug,
      cityDisplayName,
      cityStateCode,
      setCity,
      availableCities,
      isLoadingCities,
    }),
    [citySlug, cityDisplayName, cityStateCode, setCity, availableCities, isLoadingCities],
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity(): CityContextValue {
  return useContext(CityContext);
}

export default CityContext;
