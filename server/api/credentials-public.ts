import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildCredentialJson } from '../lib/spiceKreweCredentials.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.CREDENTIALS_SIGNING_SECRET?.trim();
  if (!secret) {
    res.status(503).json({ error: 'Credentials signing is not configured' });
    return;
  }

  const q = req.query;
  const userId = typeof q.userId === 'string' ? q.userId.trim() : '';
  const displayName = typeof q.displayName === 'string' ? q.displayName.trim() : 'Spice Krewe Provider';
  const obvScore = Number(q.score ?? q.obvScore);
  const engagementCount = Number(q.engagement ?? q.engagementCount);

  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }
  if (!Number.isFinite(obvScore) || !Number.isFinite(engagementCount)) {
    res.status(400).json({ error: 'score and engagement must be numbers' });
    return;
  }

  const payload = buildCredentialJson(
    { userId, displayName, obvScore, engagementCount: Math.max(0, Math.floor(engagementCount)) },
    secret,
  );

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).json(payload);
}
