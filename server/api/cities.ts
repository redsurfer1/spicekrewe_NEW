/**
 * SpiceKrewe city list API.
 * Core logic: Flomisma engine.
 * Returns all SpiceKrewe cities from Supabase. Public endpoint — no auth.
 *
 * CLEAN MODEL: Read-only. No financial data.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServiceRole } from '../lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const sb = getSupabaseServiceRole();
      const { data, error } = await sb
        .from('spicekrewe_cities')
        .select('id, slug, display_name, state_code, is_live, tagline, hero_image_url')
        .order('is_live', { ascending: false })
        .order('display_name');

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).json({ cities: data ?? [] });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Supabase request failed';
      res.status(500).json({ error: message });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error';
    res.status(500).json({ error: message });
  }
}
