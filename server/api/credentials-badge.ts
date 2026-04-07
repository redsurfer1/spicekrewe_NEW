import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildCredentialBadgeSvg } from '../lib/spiceKreweCredentials.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  const secret = process.env.CREDENTIALS_SIGNING_SECRET?.trim();
  if (!secret) {
    res.status(503).end('Not configured');
    return;
  }

  const q = req.query;
  const userId = typeof q.userId === 'string' ? q.userId.trim() : '';
  const displayName = typeof q.displayName === 'string' ? q.displayName.trim() : 'Spice Krewe Provider';
  const obvScore = Number(q.score ?? q.obvScore);
  const engagementCount = Number(q.engagement ?? q.engagementCount);

  if (!userId || !Number.isFinite(obvScore) || !Number.isFinite(engagementCount)) {
    res.status(400).end('Bad request');
    return;
  }

  const svg = buildCredentialBadgeSvg(
    { userId, displayName, obvScore, engagementCount: Math.max(0, Math.floor(engagementCount)) },
    secret,
  );

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).send(svg);
}
