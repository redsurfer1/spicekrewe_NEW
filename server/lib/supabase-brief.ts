import type { Result } from './result';
import { getSupabaseServiceRole } from './supabase';

/** Legacy + DB-shaped fields for pipelines (Auto-Scoper, matchmaker). */
export type BriefFieldsMap = Record<string, unknown>;

export type BriefRecord = {
  id: string;
  fields: BriefFieldsMap;
};

export type BriefAuditRow = {
  recordId: string;
  createdTime: string | null;
  projectTitleObfuscated: string;
  clientNameObfuscated: string;
  predictiveMatchSummary?: string;
};

function obfuscateLabel(s: string): string {
  const t = s.trim();
  if (t.length <= 1) return '•••';
  if (t.length === 2) return `${t[0]}•`;
  return `${t[0]}•••${t[t.length - 1]}`;
}

/** Maps DB row to legacy Airtable-style keys for existing pipeline code. */
export function rowToBriefFields(row: Record<string, unknown>): BriefFieldsMap {
  const tr = row.technical_requirements;
  const trForStringConsumers =
    tr == null ? undefined : typeof tr === 'string' ? tr : JSON.stringify(tr);

  return {
    ProjectTitle: row.project_title,
    project_title: row.project_title,
    ClientName: row.client_name,
    client_name: row.client_name,
    Description: row.description,
    description: row.description,
    RequiredSkills: row.required_skills,
    required_skills: row.required_skills,
    PrimaryInterestTalentIds: row.primary_interest_talent_ids,
    SourceTalentId: row.source_talent_id,
    PaymentStatus: row.payment_status,
    payment_status: row.payment_status,
    IsActive: row.is_active,
    is_active: row.is_active,
    TechnicalRequirements: trForStringConsumers,
    technical_requirements: tr,
    PredictiveMatchSummary: row.predictive_match_summary,
    predictive_match_summary: row.predictive_match_summary,
    StripeLastWebhookEventId: row.stripe_last_webhook_event_id,
    stripe_checkout_session_id: row.stripe_checkout_session_id,
  };
}

export async function getBriefRecord(recordId: string): Promise<Result<BriefRecord, Error>> {
  const id = recordId?.trim();
  if (!id) {
    return { success: false, error: new Error('recordId is required') };
  }
  const sb = getSupabaseServiceRole();
  const { data, error } = await sb.from('briefs').select('*').eq('id', id).maybeSingle();
  if (error) {
    return { success: false, error: new Error(error.message) };
  }
  if (!data) {
    return { success: false, error: new Error('Brief not found') };
  }
  const row = data as Record<string, unknown>;
  return {
    success: true,
    data: {
      id: String(row.id),
      fields: rowToBriefFields(row),
    },
  };
}

/**
 * Optional lookup by Stripe Checkout Session ID (stored on webhook completion).
 */
export async function getBriefIdByStripeCheckoutSessionId(
  sessionId: string,
): Promise<Result<string | null, Error>> {
  const sid = sessionId?.trim();
  if (!sid) return { success: true, data: null };
  const sb = getSupabaseServiceRole();
  const { data, error } = await sb
    .from('briefs')
    .select('id')
    .eq('stripe_checkout_session_id', sid)
    .maybeSingle();
  if (error) return { success: false, error: new Error(error.message) };
  const row = data as { id?: string } | null;
  return { success: true, data: row?.id ?? null };
}

/** Normalizes patch keys from legacy Airtable names to Postgres columns. */
function mapPatchToRow(patch: Record<string, string | number | boolean>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  const set = (key: string, val: unknown) => {
    if (val === undefined) return;
    out[key] = val;
  };

  for (const [k, val] of Object.entries(patch)) {
    switch (k) {
      case 'ClientName':
      case 'client_name':
        set('client_name', String(val));
        break;
      case 'ProjectTitle':
      case 'project_title':
        set('project_title', String(val));
        break;
      case 'BudgetRange':
      case 'budget_range':
        set('budget_range', String(val));
        break;
      case 'Timeline':
      case 'timeline':
        set('timeline', String(val));
        break;
      case 'Description':
      case 'description':
        set('description', String(val));
        break;
      case 'RequiredSkills':
      case 'required_skills':
        set('required_skills', String(val));
        break;
      case 'PrimaryInterestTalentIds':
      case 'primary_interest_talent_ids':
        set('primary_interest_talent_ids', String(val));
        break;
      case 'SourceTalentId':
      case 'source_talent_id':
        set('source_talent_id', String(val));
        break;
      case 'PostingTier':
      case 'posting_tier':
        set('posting_tier', String(val));
        break;
      case 'PaymentStatus':
      case 'payment_status':
        set('payment_status', String(val));
        break;
      case 'IsActive':
      case 'is_active':
        set('is_active', Boolean(val));
        break;
      case 'StripeLastWebhookEventId':
      case 'stripe_last_webhook_event_id':
        set('stripe_last_webhook_event_id', String(val));
        break;
      case 'stripe_checkout_session_id':
        set('stripe_checkout_session_id', String(val));
        break;
      case 'TechnicalRequirements':
      case 'technical_requirements': {
        if (typeof val === 'string') {
          try {
            set('technical_requirements', JSON.parse(val) as Record<string, unknown>);
          } catch {
            set('technical_requirements', { raw: val });
          }
        } else if (val && typeof val === 'object') {
          set('technical_requirements', val as Record<string, unknown>);
        }
        break;
      }
      case 'PredictiveMatchSummary':
      case 'predictive_match_summary':
        set('predictive_match_summary', String(val));
        break;
      default:
        break;
    }
  }

  out.updated_at = new Date().toISOString();
  return out;
}

export async function patchBriefRecord(
  recordId: string,
  fields: Record<string, string | number | boolean>,
): Promise<Result<void, Error>> {
  const id = recordId?.trim();
  if (!id) {
    return { success: false, error: new Error('recordId is required') };
  }
  const row = mapPatchToRow(fields);
  if (Object.keys(row).length <= 1 && row.updated_at) {
    return { success: false, error: new Error('No mappable fields to patch') };
  }

  const sb = getSupabaseServiceRole();
  const { error } = await sb.from('briefs').update(row).eq('id', id);
  if (error) {
    return { success: false, error: new Error(error.message) };
  }
  return { success: true, data: undefined };
}

export function isBriefMarkedPaid(fields: Record<string, unknown>): boolean {
  const raw = fields.PaymentStatus ?? fields.paymentStatus ?? fields.payment_status;
  if (raw === true) return true;
  if (typeof raw === 'string' && raw.trim().toLowerCase() === 'paid') return true;
  return false;
}

export async function createBriefRecord(
  fields: Record<string, string | number | boolean | string[]>,
): Promise<Result<{ recordId: string }, Error>> {
  const sb = getSupabaseServiceRole();

  const row: Record<string, unknown> = {
    client_name: String(fields.ClientName ?? fields.client_name ?? ''),
    project_title: String(fields.ProjectTitle ?? fields.project_title ?? ''),
    budget_range: String(fields.BudgetRange ?? fields.budget_range ?? ''),
    timeline: String(fields.Timeline ?? fields.timeline ?? ''),
    description: String(fields.Description ?? fields.description ?? ''),
    required_skills: String(fields.RequiredSkills ?? fields.required_skills ?? ''),
    payment_status: 'unpaid',
    is_active: false,
  };

  if (fields.PrimaryInterestTalentIds != null) {
    row.primary_interest_talent_ids = String(fields.PrimaryInterestTalentIds);
  }
  if (fields.SourceTalentId != null) {
    row.source_talent_id = String(fields.SourceTalentId);
  }

  const { data, error } = await sb.from('briefs').insert(row).select('id').single();
  if (error) {
    return { success: false, error: new Error(error.message) };
  }
  const rec = data as { id?: string };
  if (!rec?.id) {
    return { success: false, error: new Error('Supabase returned no brief id') };
  }
  return { success: true, data: { recordId: rec.id } };
}

export async function listRecentBriefsForAudit(pageSize: number): Promise<Result<BriefAuditRow[], Error>> {
  const limit = Math.min(Math.max(pageSize, 1), 30);
  const sb = getSupabaseServiceRole();
  const { data, error } = await sb
    .from('briefs')
    .select('id, created_at, client_name, project_title, predictive_match_summary')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  const rows = (data ?? []) as Array<{
    id: string;
    created_at: string | null;
    client_name: string | null;
    project_title: string | null;
    predictive_match_summary: string | null;
  }>;

  const mapped: BriefAuditRow[] = rows.map((rec) => ({
    recordId: rec.id,
    createdTime: rec.created_at ?? null,
    projectTitleObfuscated: obfuscateLabel(typeof rec.project_title === 'string' ? rec.project_title : 'Brief'),
    clientNameObfuscated: obfuscateLabel(typeof rec.client_name === 'string' ? rec.client_name : 'Client'),
    predictiveMatchSummary:
      typeof rec.predictive_match_summary === 'string' && rec.predictive_match_summary.trim()
        ? rec.predictive_match_summary.trim().slice(0, 2000)
        : undefined,
  }));

  return { success: true, data: mapped };
}

export async function pingSupabaseBriefs(): Promise<Result<'ok', Error>> {
  const started = Date.now();
  try {
    getSupabaseServiceRole();
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err };
  }
  const sb = getSupabaseServiceRole();
  const { error } = await sb.from('briefs').select('id', { count: 'exact', head: true });
  if (error) {
    return { success: false, error: new Error(error.message) };
  }
  void started;
  return { success: true, data: 'ok' };
}

/** Health: simple latency probe against Postgres via Supabase. */
export async function measureSupabaseLatencyMs(): Promise<Result<number, Error>> {
  const t0 = Date.now();
  const ping = await pingSupabaseBriefs();
  if (!ping.success) {
    return { success: false, error: ping.error };
  }
  return { success: true, data: Date.now() - t0 };
}
