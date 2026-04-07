/**
 * CLEAN MODEL: Read-only capacity check. No financial data.
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
    const headcountRaw = req.query.headcount;
    const headcount =
      typeof headcountRaw === 'string' && headcountRaw.trim() !== ''
        ? Number(headcountRaw)
        : Number(headcountRaw);

    if (!providerId) {
      res.status(400).json({ error: 'providerId is required' });
      return;
    }
    if (!Number.isFinite(headcount) || headcount < 1) {
      res.status(400).json({ error: 'headcount must be a positive number' });
      return;
    }

    const supabase = getSupabaseServiceRole();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        'id, provider_type, max_capacity, minimum_booking_hours, requires_power_hookup, service_radius_miles',
      )
      .eq('id', providerId)
      .maybeSingle();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[food-trucks-capacity]', error);
      res.status(500).json({ error: 'Lookup failed' });
      return;
    }

    if (!profile || (profile as { provider_type?: string }).provider_type !== 'food_truck') {
      res.status(404).json({ error: 'Food truck provider not found' });
      return;
    }

    const p = profile as {
      max_capacity?: number | null;
      minimum_booking_hours?: number | null;
      requires_power_hookup?: boolean | null;
      service_radius_miles?: number | null;
    };

    const maxCap = typeof p.max_capacity === 'number' ? p.max_capacity : 0;

    res.status(200).json({
      providerId,
      maxCapacity: maxCap,
      canServe: headcount <= maxCap,
      minimumBookingDuration: p.minimum_booking_hours ?? 2,
      requiresPowerHookup: p.requires_power_hookup ?? false,
      serviceRadius: `${p.service_radius_miles ?? 25} miles`,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[food-trucks-capacity]', e);
    res.status(500).json({ error: 'Capacity check failed' });
  }
}
