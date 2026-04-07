/**
 * CLEAN MODEL: Read-only availability. No financial data.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServiceRole } from '../lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const providerId = typeof req.query.providerId === 'string' ? req.query.providerId.trim() : '';
    const date = typeof req.query.date === 'string' ? req.query.date.trim() : '';

    if (!providerId || !date) {
      res.status(400).json({ error: 'providerId and date are required' });
      return;
    }

    const supabase = getSupabaseServiceRole();

    const { count, error } = await supabase
      .from('food_truck_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('event_date', date)
      .in('status', ['pending', 'confirmed']);

    if (error) {
      const msg = error.message?.toLowerCase() ?? '';
      if (msg.includes('relation') && msg.includes('does not exist')) {
        res.status(200).json({
          providerId,
          date,
          isAvailable: true,
          confirmedBookings: 0,
          note: 'availability_table_pending',
        });
        return;
      }
      // eslint-disable-next-line no-console
      console.error('[food-trucks-availability]', error);
      res.status(500).json({ error: 'Availability check failed' });
      return;
    }

    const n = count ?? 0;
    res.status(200).json({
      providerId,
      date,
      isAvailable: n === 0,
      confirmedBookings: n,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[food-trucks-availability]', e);
    res.status(500).json({ error: 'Availability check failed' });
  }
}
