import type { Result } from './types/results';
import type { TalentRecord } from '../types/talentRecord';
import { getSupabaseBrowser } from './supabase';

type ProRow = {
  id: string;
  name: string;
  initials: string | null;
  role: string | null;
  specialty: string | null;
  rate: string | null;
  rating: number | null;
  reviews: number | null;
  verified: boolean | null;
  available: boolean | null;
  avatar_color: string | null;
  avatar_text: string | null;
  tags: string[] | null;
  bio: string | null;
};

function mapRow(r: ProRow): TalentRecord {
  const tags = Array.isArray(r.tags) && r.tags.length ? r.tags : ['General'];
  return {
    id: r.id,
    name: r.name,
    initials: r.initials?.trim() || r.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 3).toUpperCase(),
    role: r.role?.trim() || 'Culinary professional',
    specialty: r.specialty?.trim() || '',
    rate: r.rate?.trim() || '',
    rating: typeof r.rating === 'number' && !Number.isNaN(r.rating) ? r.rating : 0,
    reviews: typeof r.reviews === 'number' && r.reviews >= 0 ? Math.floor(r.reviews) : 0,
    verified: Boolean(r.verified),
    available: r.available === undefined || r.available === null ? true : Boolean(r.available),
    avatarColor: r.avatar_color?.trim() || 'var(--sk-purple)',
    avatarText: r.avatar_text?.trim() || r.initials || 'SK',
    tags,
    bio: r.bio?.trim() || '',
  };
}

/**
 * Loads professionals from Supabase `professionals` (public read RLS).
 */
export async function fetchProfessionalsFromSupabase(): Promise<Result<TalentRecord[], Error>> {
  try {
    const sb = getSupabaseBrowser();
    const { data, error } = await sb.from('professionals').select('*').order('name', { ascending: true });
    if (error) {
      return { success: false, error: new Error(error.message) };
    }
    const rows = (data ?? []) as ProRow[];
    if (!rows.length) {
      return { success: false, error: new Error('No professionals in Supabase') };
    }
    return { success: true, data: rows.map(mapRow) };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err };
  }
}
