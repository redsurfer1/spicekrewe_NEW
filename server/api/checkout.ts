import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createStripeCheckoutSession, parseCheckoutBody } from '../lib/checkout-session.js';

function applyCors(res: VercelResponse, origin: string | undefined): void {
  const allow = process.env.SERVER_ALLOWED_ORIGIN?.trim() || origin || '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  applyCors(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body: unknown = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body) as unknown;
    } catch {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }
  }

  const parsed = parseCheckoutBody(body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Featured matching / hire brief checkout — chef pipeline. TODO: pass explicit flow from caller when UI distinguishes food truck featured checkout.
  const sessionResult = await createStripeCheckoutSession({
    ...parsed.data,
    flow: 'chef_booking',
  });
  if (!sessionResult.success) {
    res.status(502).json({ error: sessionResult.error.message });
    return;
  }

  res.status(200).json({ url: sessionResult.data.url });
}
