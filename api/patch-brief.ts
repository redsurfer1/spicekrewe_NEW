import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { patchBriefRecord } from '../server/lib/supabase-brief';
import { createRequestId } from '../server/lib/request-id';

const BodySchema = z.object({
  recordId: z.string().min(3).max(64),
  fields: z
    .object({
      PostingTier: z.enum(['Standard', 'Featured']).optional(),
      PrimaryInterestTalentIds: z.string().max(2000).optional(),
      SourceTalentId: z.string().max(120).optional(),
    })
    .strict(),
});

function cors(res: VercelResponse, origin: string | undefined): void {
  const allow = process.env.SERVER_ALLOWED_ORIGIN?.trim() || origin || '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id');
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  cors(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const requestId =
    (typeof req.headers['x-request-id'] === 'string' && req.headers['x-request-id'].trim()) ||
    createRequestId();

  let body: unknown = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body) as unknown;
    } catch {
      res.status(400).json({ error: 'Invalid JSON body', requestId });
      return;
    }
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join('; ');
    res.status(400).json({ error: msg, requestId });
    return;
  }

  const { recordId, fields } = parsed.data;
  const flat: Record<string, string | number | boolean> = {};
  if (fields.PostingTier !== undefined) flat.PostingTier = fields.PostingTier;
  if (fields.PrimaryInterestTalentIds !== undefined) flat.PrimaryInterestTalentIds = fields.PrimaryInterestTalentIds;
  if (fields.SourceTalentId !== undefined) flat.SourceTalentId = fields.SourceTalentId;

  if (Object.keys(flat).length === 0) {
    res.status(400).json({ error: 'No allowed fields to patch', requestId });
    return;
  }

  const patched = await patchBriefRecord(recordId, flat);
  if (!patched.success) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        audit: true,
        level: 'error',
        event: 'brief.patch_failed',
        requestId,
        recordId,
        message: patched.error.message,
      }),
    );
    res.status(502).json({ error: patched.error.message, requestId });
    return;
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      audit: true,
      level: 'info',
      event: 'brief.patched',
      requestId,
      recordId,
      keys: Object.keys(flat),
    }),
  );

  res.setHeader('X-Request-Id', requestId);
  res.status(200).json({ ok: true, requestId });
}
