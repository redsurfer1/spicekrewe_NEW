/**
 * Spice Krewe Lab — Gemini matchmaker: map scrubbed project briefs to roster professionals.
 *
 * G12/G13: Response shape is validated against `src/api/v1/schema.ts` (Flavor Intelligence contract).
 * Authoritative post-payment matching + persistence runs on the server (`server/lib/matchmakerAlerts.ts`, Stripe webhook).
 */

import { GoogleGenAI } from '@google/genai';
import { flavorMatchmakerResponseSchema } from '../../api/v1/schema';
import type { Result } from '../types/results';
import type { TalentRecord } from '../../types/talentRecord';
import { scrubContext } from './privacy';

const GEMINI_MODEL = 'gemini-1.5-flash';
const REQUEST_TIMEOUT_MS = 28_000;

export type MatchRecommendation = {
  professionalId: string;
  name: string;
  reason: string;
};

export type MatchmakerOutput = {
  matches: MatchRecommendation[];
};

function getGeminiApiKey(): string {
  const fromProcess =
    typeof process !== 'undefined' ? process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY : undefined;
  const fromVite = import.meta.env?.VITE_GEMINI_API_KEY;
  const key = fromProcess ?? fromVite;
  if (!key) {
    throw new Error(
      'No Gemini API key: set GOOGLE_API_KEY or VITE_GEMINI_API_KEY for the matchmaker.',
    );
  }
  return key;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (v) => {
        window.clearTimeout(t);
        resolve(v);
      },
      (e) => {
        window.clearTimeout(t);
        reject(e instanceof Error ? e : new Error(String(e)));
      },
    );
  });
}

function rosterDigest(roster: TalentRecord[]): string {
  return JSON.stringify(
    roster.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      specialty: p.specialty,
      tags: p.tags,
    })),
    null,
    0,
  );
}

type RawMatch = {
  professionalId?: string;
  id?: string;
  name?: string;
  reasonForMatch?: string;
  reason?: string;
};

function resolveRecommendation(raw: RawMatch, roster: TalentRecord[]): MatchRecommendation | null {
  const reason = (raw.reasonForMatch ?? raw.reason ?? '').trim();
  if (!reason) return null;

  const pid = (raw.professionalId ?? raw.id ?? '').trim();
  if (pid) {
    const t = roster.find((r) => r.id === pid);
    if (t) return { professionalId: t.id, name: t.name, reason };
  }

  const n = (raw.name ?? '').trim();
  if (n) {
    const t = roster.find((r) => r.name.toLowerCase() === n.toLowerCase());
    if (t) return { professionalId: t.id, name: t.name, reason };
    const partial = roster.find((r) => r.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(r.name.toLowerCase()));
    if (partial) return { professionalId: partial.id, name: partial.name, reason };
  }

  return null;
}

/**
 * Picks up to 3 best-fit professionals for a scrubbed brief. Returns Result for quota/timeouts/parse errors.
 */
// TODO: weight candidates by historical match_feedback satisfaction rate once feedback table has 50+ rows.
// Query: SELECT talent_id, AVG(rating::int) as score FROM match_feedback GROUP BY talent_id
export async function findTopMatches(
  brief: string,
  roster: TalentRecord[],
): Promise<Result<MatchmakerOutput, Error>> {
  if (!roster.length) {
    return { success: false, error: new Error('Roster is empty') };
  }

  const trimmed = brief.trim();
  if (!trimmed) {
    return { success: false, error: new Error('Brief is empty') };
  }

  const scrubbedBrief = scrubContext(trimmed, 'INDIVIDUAL');
  const rosterJson = rosterDigest(roster);

  try {
    const apiKey = getGeminiApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a senior talent matcher for Spice Krewe (culinary marketplace).

Given this privacy-scrubbed project brief:
"""
${scrubbedBrief}
"""

And this JSON array of professionals (each has id, name, role, specialty, tags):
${rosterJson}

Task: Identify exactly the top 3 individuals who are the best fit for the brief. If fewer than 3 are reasonable, return only those (minimum 1 if any fit). Each must reference a professional from the list by their exact "id".

Respond in the following JSON format only (no markdown fences, no extra text):
{
  "matches": [
    {
      "professionalId": "<id from the list>",
      "name": "<full name from the list>",
      "reasonForMatch": "<one sentence why they fit>"
    }
  ]
}
Return only valid JSON.`;

    const run = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        maxOutputTokens: 768,
        temperature: 0.2,
      },
    });

    const response = await withTimeout(run, REQUEST_TIMEOUT_MS, 'Gemini matchmaker');

    const text = (response.text ?? '').trim();
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}') + 1;
    const jsonStr = start >= 0 && end > start ? cleaned.slice(start, end) : cleaned;

    const parsed = JSON.parse(jsonStr) as { matches?: RawMatch[] };
    const rawList = Array.isArray(parsed.matches) ? parsed.matches : [];

    const resolved: MatchRecommendation[] = [];
    const seen = new Set<string>();
    for (const raw of rawList) {
      const m = resolveRecommendation(raw, roster);
      if (m && !seen.has(m.professionalId)) {
        seen.add(m.professionalId);
        resolved.push(m);
      }
      if (resolved.length >= 3) break;
    }

    if (!resolved.length) {
      return { success: false, error: new Error('Model returned no valid roster matches') };
    }

    const data = flavorMatchmakerResponseSchema.parse({ matches: resolved });
    return { success: true, data };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err };
  }
}
