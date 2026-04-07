/**
 * CLEAN MODEL: Read-only search. No financial data.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServiceRole } from '../lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { citySlug, cuisineType, minCapacity } = req.query;

    if (!citySlug || typeof citySlug !== 'string') {
      res.status(400).json({ error: 'citySlug is required' });
      return;
    }

    const supabase = getSupabaseServiceRole();

    let query = supabase
      .from('profiles')
      .select(
        'id, display_name, truck_name, cuisine_categories, max_capacity, city_slug, provider_type, health_permit_verified, obi_score, review_count, is_verified',
      )
      .eq('provider_type', 'food_truck')
      .eq('city_slug', citySlug);

    if (cuisineType && typeof cuisineType === 'string') {
      query = query.contains('cuisine_categories', [cuisineType]);
    }

    if (minCapacity && !Number.isNaN(Number(minCapacity))) {
      query = query.gte('max_capacity', Number(minCapacity));
    }

    const { data, error } = await query;

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[food-trucks-search]', error);
      res.status(500).json({ error: 'Search failed' });
      return;
    }

    const ranked = (data ?? []).sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const av = a.is_verified === true;
      const bv = b.is_verified === true;
      if (av !== bv) return av ? -1 : 1;
      const as = typeof a.obi_score === 'number' ? a.obi_score : 0;
      const bs = typeof b.obi_score === 'number' ? b.obi_score : 0;
      return bs - as;
    });

    res.status(200).json({
      results: ranked,
      count: ranked.length,
      citySlug,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[food-trucks-search]', e);
    res.status(500).json({ error: 'Search failed' });
  }
}
