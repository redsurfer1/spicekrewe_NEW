import type { VercelRequest, VercelResponse } from '@vercel/node';
import availabilityHandler from '../server/api/food-trucks-availability.js';
import bookHandler from '../server/api/food-trucks-book.js';
import capacityHandler from '../server/api/food-trucks-capacity.js';
import searchHandler from '../server/api/food-trucks-search.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const action = typeof req.query.action === 'string' ? req.query.action : '';
  if (action === 'search') return searchHandler(req, res);
  if (action === 'capacity') return capacityHandler(req, res);
  if (action === 'availability') return availabilityHandler(req, res);
  if (action === 'book') return bookHandler(req, res);
  res.status(400).json({ error: 'Unknown action' });
}
