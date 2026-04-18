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
    role: 'Estate & Executive Private Chef',
    specialty: 'Specializing in multi-course fine dining, formal events, and full-service household culinary management.',
    rate: '$175/hr',
    rating: 4.9,
    reviews: 42,
    verified: true,
    available: true,
    avatarColor: 'var(--sk-purple)',
    avatarText: 'MJ',
    tags: ['Fine Dining', 'Formal Events', 'Menu Design'],
    bio: 'Former hotel executive chef turned independent consultant. Marcus helps brands launch concepts, tighten food cost, and train brigades without losing soul in the plate.',
    obvScore: 78,
    providerType: 'private_chef',
  },
  // slug generated via generateSlug(name) — do not manually edit the slug without also updating vercel.json redirects for the old slug.
  {
    id: 'aisha-thompson',
    name: 'Aisha Thompson',
    initials: 'AT',
    role: 'Wellness & Performance Private Chef',
    specialty: 'Focus on specialized dietary protocols, athletic nutrition, and allergen-aware family meal preparation.',
    rate: '$165/hr',
    rating: 5.0,
    reviews: 38,
    verified: true,
    available: true,
    avatarColor: 'var(--sk-blue)',
    avatarText: 'AT',
    tags: ['Dietary Specs', 'Performance Nutrition', 'Meal Prep'],
    bio: 'Aisha bridges performance science and everyday family cooking — she designs precise protocols and builds lasting household nutrition systems.',
    obvScore: 71,
    providerType: 'private_chef',
  },
  {
    id: 'rafael-cruz',
    name: 'Rafael Cruz',
    initials: 'RC',
    role: 'Boutique Event & Social Chef',
    specialty: 'Curating intimate social gatherings and interactive tasting experiences with a seasonal, farm-to-table approach.',
    rate: '$150/hr',
    rating: 4.8,
    reviews: 56,
    verified: true,
    available: false,
    avatarColor: 'var(--sk-navy)',
    avatarText: 'RC',
    tags: ['Intimate Events', 'Seasonal Menus', 'Farm-to-Table'],
    bio: 'Rafael designs social dining experiences that feel personal and unhurried — sourcing locally, building menus around the season, and turning a dinner into a memory.',
    obvScore: 64,
    providerType: 'private_chef',
  },
  // slug generated via generateSlug(name) — do not manually edit the slug without also updating vercel.json redirects for the old slug.
  {
    id: 'dana-nguyen',
    name: 'Dana Nguyen',
    initials: 'DN',
    role: 'Global Fusion & Sensory Chef',
    specialty: 'Providing cross-cultural tasting menus and sensory-driven culinary experiences for discerning clients.',
    rate: '$190/hr',
    rating: 5.0,
    reviews: 29,
    verified: true,
    available: true,
    avatarColor: 'var(--sk-gold)',
    avatarText: 'DN',
    tags: ['Global Fusion', 'Tasting Menus', 'Sensory Mapping'],
    bio: 'Dana blends sensory science with cross-cultural intuition — building tasting experiences that feel both transportive and cohesive for discerning private clients.',
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
