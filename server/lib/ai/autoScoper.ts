import { GoogleGenAI } from '@google/genai';
import type { Result } from '../result';

const GEMINI_MODEL = 'gemini-1.5-flash';

export type TechnicalRequirementsDocument = {
  /** Estimated total R&D hours for the scoped work (single point estimate). */
  estimatedRdHours: number;
  /** Professional capabilities needed (e.g. shelf-stable formulation, co-packer sourcing). */
  requiredSkillsets: string[];
  /** FDA / USDA and related compliance considerations. */
  potentialRegulatoryHurdles: string[];
  /** Short ops-facing summary for the TRD block. */
  summary: string;
};

function getGeminiApiKey(): string | undefined {
  return process.env.GOOGLE_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim();
}

function clampDescription(raw: string, max = 12000): string {
  const t = raw.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

/**
 * Heuristic TRD when Gemini is unavailable (keeps the pipeline non-blocking).
 */
export function buildFallbackTrd(projectDescription: string): TechnicalRequirementsDocument {
  const snippet = clampDescription(projectDescription, 600);
  return {
    estimatedRdHours: 40,
    requiredSkillsets: [
      'Product development & formulation',
      'Supplier / co-manufacturer coordination',
      'Label & claims review support',
    ],
    potentialRegulatoryHurdles: [
      'Confirm FDA vs USDA jurisdiction and applicable facility requirements for the product category.',
      'Validate allergen labeling, identity standards, and any GRAS / additive questions with counsel as needed.',
    ],
    summary: `Auto-Scoper fallback (Gemini unavailable). Scope excerpt: ${snippet}`,
  };
}

function parseTrdJson(text: string): TechnicalRequirementsDocument {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}') + 1;
  const jsonStr = start >= 0 && end > start ? cleaned.slice(start, end) : cleaned;
  const raw = JSON.parse(jsonStr) as Record<string, unknown>;

  const hours =
    typeof raw.estimatedRdHours === 'number' && Number.isFinite(raw.estimatedRdHours)
      ? Math.round(raw.estimatedRdHours)
      : typeof raw.estimated_rd_hours === 'number' && Number.isFinite(raw.estimated_rd_hours)
        ? Math.round(raw.estimated_rd_hours)
        : 40;

  const skillRaw = raw.requiredSkillsets ?? raw.required_skillsets;
  const skills = Array.isArray(skillRaw)
    ? skillRaw.map((s) => String(s).trim()).filter(Boolean)
    : [];

  const regRaw = raw.potentialRegulatoryHurdles ?? raw.potential_regulatory_hurdles;
  const regs = Array.isArray(regRaw)
    ? regRaw.map((s) => String(s).trim()).filter(Boolean)
    : [];

  const summary =
    typeof raw.summary === 'string' && raw.summary.trim()
      ? raw.summary.trim()
      : 'Technical requirements generated from project description.';

  return {
    estimatedRdHours: Math.min(Math.max(hours, 1), 5000),
    requiredSkillsets: skills.length ? skills.slice(0, 24) : buildFallbackTrd('').requiredSkillsets,
    potentialRegulatoryHurdles: regs.length ? regs.slice(0, 24) : buildFallbackTrd('').potentialRegulatoryHurdles,
    summary,
  };
}

/**
 * Serializes the TRD for JSONB / API storage (readable + machine-parseable).
 */
export function formatTrdForAirtable(trd: TechnicalRequirementsDocument): string {
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    estimatedRdHours: trd.estimatedRdHours,
    requiredSkillsets: trd.requiredSkillsets,
    potentialRegulatoryHurdles: trd.potentialRegulatoryHurdles,
    summary: trd.summary,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Analyzes a project / brief description and returns a structured Technical Requirements Document via Gemini.
 */
export async function generateTechnicalRequirementsDocument(
  projectDescription: string,
): Promise<Result<TechnicalRequirementsDocument, Error>> {
  const trimmed = projectDescription?.trim() ?? '';
  if (!trimmed.length) {
    return { success: false, error: new Error('Project description is empty') };
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return { success: true, data: buildFallbackTrd(trimmed) };
  }

  const body = clampDescription(trimmed);
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a senior food product R&D and regulatory strategist for Spice Krewe (culinary marketplace / CPG).

Given this client project description (may include product, process, timeline, and market):
"""
${body}
"""

Produce a concise Technical Requirements Document (TRD) for internal ops.

Respond in the following JSON only (no markdown fences, no extra text):
{
  "estimatedRdHours": <integer, realistic total R&D hours for the described scope>,
  "requiredSkillsets": ["5-12 specific professional capabilities, e.g. Shelf-Stable Formulation", "Co-Packer Sourcing", "Sensory & shelf-life testing", "HACCP / process authority support"],
  "potentialRegulatoryHurdles": ["5-12 bullets focused on FDA/USDA: product category, facility, labeling, claims, imports, inspection, FSMA, etc. as applicable"],
  "summary": "Short paragraph tying scope to the estimate and key risks."
}

Return only valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        maxOutputTokens: 2048,
        temperature: 0.2,
      },
    });

    const text = (response.text ?? '').trim();
    if (!text) {
      return { success: true, data: buildFallbackTrd(trimmed) };
    }

    const trd = parseTrdJson(text);
    return { success: true, data: trd };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err };
  }
}
