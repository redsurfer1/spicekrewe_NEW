import type { VercelRequest, VercelResponse } from '@vercel/node';
import healthHandler from '../server/api/admin-health.js';
import secretsHealthHandler from '../server/api/admin-secrets-health.js';
import sessionHandler from '../server/api/admin-session.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const action = typeof req.query.action === 'string' ? req.query.action : '';
  if (action === 'health') return healthHandler(req, res);
  if (action === 'secrets-health') return secretsHealthHandler(req, res);
  if (action === 'session') return sessionHandler(req, res);
  res.status(400).json({ error: 'Unknown action' });
}
