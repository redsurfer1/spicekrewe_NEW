import type { VercelRequest, VercelResponse } from '@vercel/node';
import acceptHandler from '../server/api/concierge-accept.js';
import providerResponseHandler from '../server/api/concierge-provider-response.js';
import submitHandler from '../server/api/concierge-submit.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const action = typeof req.query.action === 'string' ? req.query.action : '';
  if (action === 'submit') return submitHandler(req, res);
  if (action === 'accept') return acceptHandler(req, res);
  if (action === 'provider-response') return providerResponseHandler(req, res);
  res.status(400).json({ error: 'Unknown action' });
}
