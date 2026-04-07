import type { Result } from '../lib/types/results';
import type { TalentRecord } from '../types/talentRecord';
import { fetchProfessionalsFromSupabase } from '../lib/professionalsFromSupabase';

export type { TalentRecord } from '../types/talentRecord';

/** Profile ids shown for `?location=Memphis` on the talent directory (Mid-South roster). */
export const MEMPHIS_AREA_TALENT_IDS: readonly string[] = ['rafael-cruz', 'mid-south-smoke-truck'];

/** `?location=Nashville` directory filter (Music City roster). */
export const NASHVILLE_AREA_TALENT_IDS: readonly string[] = ['marcus-johnson', 'aisha-thompson'];

/** `?location=New Orleans` directory filter (Gulf South roster). */
export const NEW_ORLEANS_AREA_TALENT_IDS: readonly string[] = ['rafael-cruz'];

/** Offline / fallback seed — used when Supabase is unavailable or returns an error.
 * Server predictive matchmaking mirrors this roster in `server/data/talentRoster.ts` — keep both in sync. */
export const TALENT_FALLBACK: TalentRecord[] = [
  // slug generated via generateSlug(name) — do not manually edit the slug without also updating vercel.json redirects for the old slug.
  {
    id: 'marcus-johnson',
    name: 'Marcus Johnson',
    initials: 'MJ',
    role: 'Executive Chef & Operations Consultant',
    specialty: 'Menu engineering, kitchen systems, and team leadership',
    rate: '$175/hr',
    rating: 4.9,
    reviews: 42,
    verified: true,
    available: true,
    avatarColor: 'var(--sk-purple)',
    avatarText: 'MJ',
    tags: ['Menu Design', 'Private Chef', 'Recipe Development'],
    bio: 'Former hotel executive chef turned independent consultant. Marcus helps brands launch concepts, tighten food cost, and train brigades without losing soul in the plate.',
    obvScore: 78,
    providerType: 'private_chef',
  },
  // slug generated via generateSlug(name) — do not manually edit the slug without also updating vercel.json redirects for the old slug.
  {
    id: 'aisha-thompson',
    name: 'Aisha Thompson',
    initials: 'AT',
    role: 'Recipe Developer & R&D Lead',
    specialty: 'Scalable formulations, allergen-aware menus, and co-packer handoffs',
    rate: '$165/hr',
    rating: 4.95,
    reviews: 38,
    verified: true,
    available: true,
    avatarColor: 'var(--sk-blue)',
    avatarText: 'AT',
    tags: ['Recipe Development', 'Flavor Consulting', 'Culinary Content'],
    bio: 'Aisha bridges CPG and restaurant R&D: she writes specs, runs bench tests, and documents processes so your product tastes the same at line 1 and line 100.',
    obvScore: 71,
    providerType: 'private_chef',
  },
  {
    id: 'rafael-cruz',
    name: 'Rafael Cruz',
    initials: 'RC',
    role: 'Food Stylist & Photo/Video Partner',
    specialty: 'Editorial, e‑commerce, and campaign shoots with motion',
    rate: '$150/hr',
    rating: 4.85,
    reviews: 56,
    verified: true,
    available: false,
    avatarColor: 'var(--sk-navy)',
    avatarText: 'RC',
    tags: ['Food Styling', 'Culinary Content'],
    bio: 'Rafael crafts hero shots and short-form content for national brands. His sets stay efficient, on-brief, and edible-safe from first frame to wrap.',
    obvScore: 64,
    providerType: 'private_chef',
  },
  // slug generated via generateSlug(name) — do not manually edit the slug without also updating vercel.json redirects for the old slug.
  {
    id: 'dana-nguyen',
    name: 'Dana Nguyen',
    initials: 'DN',
    role: 'Flavor Consultant & Sensory Strategist',
    specialty: 'Tasting panels, flavor maps, and cross-cultural menu balance',
    rate: '$190/hr',
    rating: 5.0,
    reviews: 29,
    verified: true,
    available: true,
    avatarColor: 'var(--sk-gold)',
    avatarText: 'DN',
    tags: ['Flavor Consulting', 'Menu Design', 'Recipe Development'],
    bio: 'Dana blends sensory science with street-level intuition—helping teams articulate “why this works” and ship flavors that resonate in multiple markets.',
    obvScore: 88,
    providerType: 'private_chef',
  },
  {
    id: 'mid-south-smoke-truck',
    name: 'Mid-South Smoke & Pickle',
    initials: 'MS',
    role: 'Food Truck — BBQ & Southern sides',
    specialty: 'Corporate lunches, festivals, and private lot service (Memphis / Mid-South)',
    rate: '$2.8k minimum event',
    rating: 4.92,
    reviews: 34,
    verified: true,
    available: true,
    avatarColor: 'var(--sk-purple)',
    avatarText: 'MS',
    tags: ['Food Truck', 'Private Chef'],
    bio: 'Wood-fired BBQ, vegetarian sides, and fast line service for 50–500 guests. Health permit and commissary on file.',
    obvScore: 69,
    providerType: 'food_truck',
  },
];

/** @deprecated Prefer `TALENT_FALLBACK` or `fetchTalentDirectory()`. Kept for backward imports. */
export const talent: TalentRecord[] = TALENT_FALLBACK;

/** Sidebar / pill labels; order is stable for UI */
export const CULINARY_CATEGORIES = [
  'Recipe Development',
  'Food Styling',
  'Flavor Consulting',
  'Private Chef',
  'Food Truck',
  'Menu Design',
  'Culinary Content',
] as const;

/** Narrow model: directory filters only align to bookable cohorts. */
export const NARROW_BOOKING_CATEGORIES = ['Private Chef', 'Food Truck'] as const;

/** Map city slug → directory roster ids (seed + curated filters). Unknown slug = no extra filter. */
export function filterRosterByCitySlug(list: TalentRecord[], citySlug: string): TalentRecord[] {
  const key = citySlug.trim().toLowerCase();
  const map: Record<string, readonly string[]> = {
    memphis: MEMPHIS_AREA_TALENT_IDS,
    nashville: NASHVILLE_AREA_TALENT_IDS,
    'new-orleans': NEW_ORLEANS_AREA_TALENT_IDS,
    new_orleans: NEW_ORLEANS_AREA_TALENT_IDS,
  };
  const ids = map[key];
  if (!ids?.length) return list;
  return list.filter((t) => ids.includes(t.id));
}

export type CulinaryCategory = (typeof CULINARY_CATEGORIES)[number];

export type GetTalentError = 'PROFESSIONAL_NOT_FOUND';

/**
 * Loads directory from Supabase `professionals` when `VITE_SUPABASE_*` is configured; otherwise seed.
 * Safe for Capacitor / offline: never throws.
 */
export async function fetchTalentDirectory(): Promise<TalentRecord[]> {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL?.trim() || !import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()) {
      return [...TALENT_FALLBACK];
    }
    const res = await fetchProfessionalsFromSupabase();
    if (res.success && res.data.length > 0) {
      return res.data;
    }
  } catch {
    /* fall through */
  }
  return [...TALENT_FALLBACK];
}

/**
 * Lookup by slug id within a roster (defaults to fallback seed).
 */
export function getTalentById(id: string, roster: TalentRecord[] = TALENT_FALLBACK): Result<TalentRecord, GetTalentError> {
  const trimmed = id?.trim() ?? '';
  if (!trimmed) {
    return { success: false, error: 'PROFESSIONAL_NOT_FOUND' };
  }
  const row = roster.find((t) => t.id === trimmed);
  if (!row) {
    return { success: false, error: 'PROFESSIONAL_NOT_FOUND' };
  }
  return { success: true, data: row };
}
