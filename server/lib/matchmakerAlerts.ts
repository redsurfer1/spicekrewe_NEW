import type { TechnicalRequirementsDocument } from './ai/autoScoper';
import { PROFESSIONAL_ROSTER, type ServerTalentRecord } from '../data/talentRoster';
import { patchBriefRecord } from './supabase-brief';
import { appendMatchmakerLog, type MatchmakerLogEntry } from './matchmakerLogStore';

export type { MatchmakerLogEntry };

/**
 * Future: SendGrid (transactional email) / Twilio (SMS) — pass professional CRM contacts when available.
 */
export type MatchAlertRecipient = {
  professionalId: string;
  name: string;
  email?: string;
  phoneE164?: string;
};

export type MatchNotificationPayload = {
  briefId: string;
  projectName: string;
  message: string;
  recipients: MatchAlertRecipient[];
};

/**
 * Placeholder for real-time notifications. Wire SendGrid/Twilio here without blocking the webhook.
 */
export async function queueMatchNotificationsForPrototype(payload: MatchNotificationPayload): Promise<void> {
  void payload;
  // Future: SendGrid — sendTemplate({ to: recipients.map(r => r.email), templateId: 'MATCH_ALERT' })
  // Future: Twilio — recipients.filter(r => r.phoneE164).map(r => client.messages.create({ ... }))
}

function parseTechnicalRequirementsJson(raw: string): TechnicalRequirementsDocument | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const obj = JSON.parse(trimmed) as Record<string, unknown>;
    const skills = obj.requiredSkillsets ?? obj.required_skillsets;
    if (!Array.isArray(skills)) return null;
    const requiredSkillsets = skills.map((s) => String(s).trim()).filter(Boolean);
    return {
      estimatedRdHours: typeof obj.estimatedRdHours === 'number' ? obj.estimatedRdHours : 40,
      requiredSkillsets,
      potentialRegulatoryHurdles: Array.isArray(obj.potentialRegulatoryHurdles)
        ? (obj.potentialRegulatoryHurdles as unknown[]).map((s) => String(s))
        : [],
      summary: typeof obj.summary === 'string' ? obj.summary : '',
    };
  } catch {
    return null;
  }
}

function splitBriefRequiredSkills(raw: unknown): string[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return raw
    .split(/[;,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Collects skill phrases from TRD JSON (TechnicalRequirements) and RequiredSkills on the brief.
 */
export function extractSkillNeedlesFromBriefFields(fields: Record<string, unknown>): string[] {
  const out: string[] = [];
  const tr = fields.TechnicalRequirements ?? fields.technicalRequirements ?? fields.technical_requirements;
  if (tr && typeof tr === 'object' && tr !== null && !Array.isArray(tr)) {
    const obj = tr as Record<string, unknown>;
    const skills = obj.requiredSkillsets ?? obj.required_skillsets;
    if (Array.isArray(skills)) {
      out.push(...skills.map((s) => String(s).trim()).filter(Boolean));
    }
  } else if (typeof tr === 'string' && tr.trim()) {
    const parsed = parseTechnicalRequirementsJson(tr);
    if (parsed?.requiredSkillsets?.length) {
      out.push(...parsed.requiredSkillsets);
    }
  }
  const rs = fields.RequiredSkills ?? fields.requiredSkills ?? fields.required_skills;
  out.push(...splitBriefRequiredSkills(rs));
  const seen = new Set<string>();
  return out.filter((s) => {
    const k = s.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function normalizeCorpus(p: ServerTalentRecord): string {
  return `${p.role} ${p.specialty} ${p.bio} ${p.tags.join(' ')}`.toLowerCase();
}

/**
 * Scores overlap between TRD/brief skill phrases and each professional (tags, role, specialty, bio).
 */
export function rankTopThreeProfessionals(
  roster: ServerTalentRecord[],
  skillPhrases: string[],
): { id: string; name: string; score: number }[] {
  if (!roster.length) return [];
  const phrases = skillPhrases.map((s) => s.trim()).filter(Boolean);
  if (!phrases.length) return [];

  const scored = roster.map((p) => {
    const corpus = normalizeCorpus(p);
    let score = 0;
    for (const phrase of phrases) {
      const pl = phrase.toLowerCase();
      if (pl.length >= 4 && corpus.includes(pl)) score += 8;
      const words = pl.split(/\s+/).filter((w) => w.length > 2);
      for (const w of words) {
        if (corpus.includes(w)) score += 2;
      }
      for (const tag of p.tags) {
        const tl = tag.toLowerCase();
        if (pl.includes(tl) || tl.includes(pl.slice(0, Math.min(pl.length, 12)))) score += 5;
      }
    }
    for (const tag of p.tags) {
      for (const phrase of phrases) {
        if (phrase.toLowerCase().includes(tag.toLowerCase())) score += 3;
      }
    }
    return { id: p.id, name: p.name, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const minScore = 1;
  const filtered = scored.filter((s) => s.score >= minScore);
  const top = (filtered.length ? filtered : scored).slice(0, 3);
  return top.map((t) => ({ id: t.id, name: t.name, score: t.score }));
}

function fallbackSkillsFromDescription(fields: Record<string, unknown>): string[] {
  const d = fields.Description ?? fields.description;
  if (typeof d !== 'string' || !d.trim()) return [];
  const tokens = d
    .toLowerCase()
    .split(/[^a-z0-9+]+/g)
    .filter((w) => w.length > 4)
    .slice(0, 12);
  return [...new Set(tokens)];
}

/**
 * Runs after a Featured brief is paid: compares TRD + brief skills to `PROFESSIONAL_ROSTER`, logs match, optional `predictive_match_summary` patch.
 */
export async function runPredictiveMatchmakerAfterFeaturedPayment(
  briefId: string,
  fields: Record<string, unknown>,
): Promise<void> {
  const rawTitle = fields.ProjectTitle ?? fields.projectTitle;
  const projectName = typeof rawTitle === 'string' && rawTitle.trim() ? rawTitle.trim() : 'Project';

  let needles = extractSkillNeedlesFromBriefFields(fields);
  if (!needles.length) {
    needles = fallbackSkillsFromDescription(fields);
  }
  if (!needles.length) {
    const message = `MATCH PENDING: ${projectName} — add Required Skills or TechnicalRequirements (TRD) for predictive matching.`;
    appendMatchmakerLog({
      briefId,
      projectName,
      message,
      topMatches: [],
    });
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        audit: true,
        level: 'info',
        event: 'matchmaker.pending',
        briefId,
        message,
      }),
    );
    return;
  }

  const top = rankTopThreeProfessionals(PROFESSIONAL_ROSTER, needles);
  const names = top.length ? top.map((t) => t.name) : PROFESSIONAL_ROSTER.slice(0, 3).map((p) => p.name);
  const scored = top.length ? top : PROFESSIONAL_ROSTER.slice(0, 3).map((p) => ({ id: p.id, name: p.name, score: 0 }));

  const list = names.slice(0, 3);
  const message = `MATCH FOUND: ${projectName} matches ${list.join(', ')}`;

  const entry = appendMatchmakerLog({
    briefId,
    projectName,
    message,
    topMatches: scored.slice(0, 3).map((s) => ({ id: s.id, name: s.name, score: s.score })),
  });

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      audit: true,
      level: 'info',
      event: 'matchmaker.alert',
      briefId,
      message,
      topMatches: entry.topMatches,
    }),
  );

  const patched = await patchBriefRecord(briefId, {
    predictive_match_summary: message,
  });
  if (!patched.success) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        audit: true,
        level: 'warn',
        event: 'matchmaker.brief_patch_skipped',
        briefId,
        detail: patched.error.message,
      }),
    );
  }

  const recipients: MatchAlertRecipient[] = scored.slice(0, 3).map((s) => ({
    professionalId: s.id,
    name: s.name,
  }));
  await queueMatchNotificationsForPrototype({
    briefId,
    projectName,
    message,
    recipients,
  });
}

export { getRecentMatchmakerLogs } from './matchmakerLogStore';
