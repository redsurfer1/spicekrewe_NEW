import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { getSupabaseServiceRole } from '../lib/supabase';

function cors(res: VercelResponse, origin: string | undefined): void {
  const allow = process.env.SERVER_ALLOWED_ORIGIN?.trim() || origin || '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function appOriginBase(): string {
  return (
    process.env.VITE_APP_ORIGIN?.trim() ||
    process.env.APP_ORIGIN?.trim() ||
    'https://spicekrewe.com'
  ).replace(/\/$/, '');
}

/** Email link clicks use GET → send users to the branded thank-you page instead of raw JSON. */
function redirectMatchConfirmed(res: VercelResponse, query?: Record<string, string>): void {
  const u = new URL('/hire/match-confirmed', `${appOriginBase()}/`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v) u.searchParams.set(k, v);
    }
  }
  res.redirect(302, u.toString());
}

function parseRating(raw: string | undefined): boolean | null {
  const t = raw?.trim().toLowerCase();
  if (t === 'good' || t === 'true' || t === '1') return true;
  if (t === 'bad' || t === 'false' || t === '0') return false;
  return null;
}

function tokensMatch(expected: string, provided: string): boolean {
  const a = expected.trim().toLowerCase();
  const b = provided.trim().toLowerCase();
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  cors(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const wantsRedirect = req.method === 'GET';

  let bookingId: string | undefined;
  let ratingRaw: string | undefined;
  let secureToken: string | undefined;

  if (req.method === 'POST') {
    let body: unknown = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body) as unknown;
      } catch {
        res.status(400).json({ error: 'Invalid JSON body' });
        return;
      }
    }
    const b = body as { bookingId?: unknown; rating?: unknown; token?: unknown };
    bookingId = typeof b.bookingId === 'string' ? b.bookingId.trim() : undefined;
    ratingRaw = typeof b.rating === 'string' ? b.rating : undefined;
    secureToken = typeof b.token === 'string' ? b.token.trim() : undefined;
  } else {
    const q = req.query as Record<string, string | string[] | undefined>;
    bookingId = typeof q.bookingId === 'string' ? q.bookingId.trim() : undefined;
    ratingRaw = typeof q.rating === 'string' ? q.rating : undefined;
    secureToken = typeof q.token === 'string' ? q.token.trim() : undefined;
  }

  if (!bookingId) {
    if (wantsRedirect) {
      redirectMatchConfirmed(res, { error: 'invalid' });
      return;
    }
    res.status(400).json({ error: 'bookingId is required' });
    return;
  }
  if (!secureToken) {
    if (wantsRedirect) {
      redirectMatchConfirmed(res, { error: 'invalid' });
      return;
    }
    res.status(403).json({ error: 'token is required (signed feedback link)' });
    return;
  }

  const rating = parseRating(ratingRaw);
  if (rating === null) {
    if (wantsRedirect) {
      redirectMatchConfirmed(res, { error: 'invalid' });
      return;
    }
    res.status(400).json({ error: 'rating must be good or bad' });
    return;
  }

  try {
    const sb = getSupabaseServiceRole();
    const { data: booking, error: bErr } = await sb
      .from('bookings')
      .select('id, brief_id, secure_token')
      .eq('id', bookingId)
      .maybeSingle();
    if (bErr || !booking) {
      if (wantsRedirect) {
        redirectMatchConfirmed(res, { error: 'not_found' });
        return;
      }
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    const row = booking as { id: string; brief_id: string; secure_token: string | null };
    if (!row.secure_token || !tokensMatch(row.secure_token, secureToken)) {
      if (wantsRedirect) {
        redirectMatchConfirmed(res, { error: 'invalid' });
        return;
      }
      res.status(403).json({ error: 'Invalid or expired feedback token' });
      return;
    }
    const briefId = String(row.brief_id);

    const { error: insErr } = await sb.from('match_feedback').insert({
      booking_id: bookingId,
      brief_id: briefId,
      rating,
    });

    if (insErr) {
      if (insErr.code === '23505') {
        if (wantsRedirect) {
          redirectMatchConfirmed(res);
          return;
        }
        res.status(200).json({ ok: true, duplicate: true });
        return;
      }
      if (wantsRedirect) {
        redirectMatchConfirmed(res, { error: 'server' });
        return;
      }
      res.status(500).json({ error: insErr.message });
      return;
    }

    if (wantsRedirect) {
      redirectMatchConfirmed(res);
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    if (wantsRedirect) {
      redirectMatchConfirmed(res, { error: 'server' });
      return;
    }
    res.status(500).json({ error: msg });
  }
}
