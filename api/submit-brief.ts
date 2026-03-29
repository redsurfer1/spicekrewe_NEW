/**
 * Brief intake: inserts into Supabase `briefs` (service role).
 * Post-payment: successful Stripe Featured checkout (`spiceKreweCheckout: featured_matching`) triggers
 * Auto-Scoper in `server/lib/webhook-checkout-completed.ts`, which writes `technical_requirements` (JSONB).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createBriefRecord } from '../server/lib/supabase-brief';
import { createRequestId } from '../server/lib/request-id';
import { HireBriefSchema } from '../server/lib/hire-brief-schema';
import { sanitizeBriefShortText } from '../server/lib/sanitize-brief-fields';

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

  const parsed = HireBriefSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join('; ');
    res.status(400).json({ error: msg, requestId });
    return;
  }

  const data = parsed.data;
  const clientName = sanitizeBriefShortText(data.clientName, 200);
  const projectTitle = sanitizeBriefShortText(data.projectTitle, 300);
  if (!clientName.length || !projectTitle.length) {
    res.status(400).json({ error: 'Client name and project title are required after sanitization', requestId });
    return;
  }

  const primaryIds = (data.primaryInterestTalentIds ?? []).filter(Boolean);
  const fields: Record<string, string | number | boolean | string[]> = {
    ClientName: clientName,
    ProjectTitle: projectTitle,
    BudgetRange: data.budgetRange.trim().slice(0, 120),
    Timeline: data.timeline.trim().slice(0, 200),
    Description: data.description.trim().slice(0, 8000),
    RequiredSkills: data.requiredSkills.join('; ').slice(0, 4000),
  };

  if (primaryIds.length) {
    fields.PrimaryInterestTalentIds = primaryIds.join('; ').slice(0, 2000);
  }
  if (data.sourceTalentId?.trim()) {
    fields.SourceTalentId = data.sourceTalentId.trim().slice(0, 120);
  }

  const created = await createBriefRecord(fields);
  if (!created.success) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        audit: true,
        level: 'error',
        event: 'brief.submit_failed',
        requestId,
        message: created.error.message,
      }),
    );
    res.status(502).json({ error: created.error.message, requestId });
    return;
  }

  // SOC2-style audit trail (stdout — ship to SIEM from Vercel log drains).
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      audit: true,
      level: 'info',
      event: 'brief.submitted',
      requestId,
      recordId: created.data.recordId,
      clientNameLen: clientName.length,
      projectTitleLen: projectTitle.length,
    }),
  );

  res.setHeader('X-Request-Id', requestId);
  res.status(200).json({ recordId: created.data.recordId, requestId });
}
