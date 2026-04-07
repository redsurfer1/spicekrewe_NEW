/**
 * conciergeAgent.ts
 *
 * SpiceKrewe native implementation.
 * Core logic provided by Flomisma engine.
 * Customized for SpiceKrewe culinary vertical.
 *
 * This file has no external API dependencies beyond Anthropic HTTP.
 * Data layer: Supabase.
 * AI layer: Anthropic Claude.
 *
 * CLEAN MODEL: Concierge is a free service.
 * Platform fee applies to resulting bookings.
 * See: docs/dual-entity-operating-boundary.md
 */

import { getSupabaseServiceRole } from './supabase.js';

const HUMAN_REVIEW_TOTAL_CENTS = 500_000;

export type EventScale = 'intimate' | 'gathering' | 'large';

export function eventScaleFromGuestCount(guestCount: number): EventScale {
  if (guestCount <= 20) return 'intimate';
  if (guestCount <= 75) return 'gathering';
  return 'large';
}

export interface ProviderSummary {
  id: string;
  displayName: string;
  providerType: 'private_chef' | 'food_truck';
  truckName?: string;
  categorySlug?: string;
  cuisineCategories?: string[];
  ratePerHour?: number | null;
  obiScore?: number | null;
  reviewCount?: number | null;
  isVerified?: boolean | null;
  bio?: string | null;
}

export interface PackageItem {
  providerId: string;
  providerName: string;
  providerType: 'private_chef' | 'food_truck';
  serviceType: string;
  estimatedCostCents: number;
  notes?: string;
}

export interface ConciergeBriefInput {
  eventType: string;
  guestCount: number;
  eventScale: EventScale;
  theme?: string | null;
  budgetCents: number;
  eventDate?: string | null;
  locationNotes?: string | null;
  citySlug: string;
  cityDisplayName: string;
  chefs: ProviderSummary[];
  trucks: ProviderSummary[];
}

export interface ConciergePackageResult {
  packageItems: PackageItem[];
  estimatedTotalCents: number;
  packageNarrative: string;
  requiresHumanReview: boolean;
  eventScale: EventScale;
}

function formatProviderList(providers: ProviderSummary[], type: string): string {
  if (providers.length === 0) return `No ${type} providers available.`;
  return providers
    .map((p) => {
      const cuisines = (p.cuisineCategories ?? []).join(', ') || 'General';
      const rate =
        typeof p.ratePerHour === 'number' && p.ratePerHour > 0
          ? `$${(p.ratePerHour / 100).toFixed(2)}/hr`
          : 'contact for pricing';
      const verified = p.isVerified ? ' | ✓ Verified' : '';
      const truck = p.truckName ? ` (${p.truckName})` : '';
      return `- ID: ${p.id} | ${p.displayName}${truck} | ${cuisines} | Rate: ${rate} | Rating: ${p.obiScore ?? 'new'}${verified}`;
    })
    .join('\n');
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Load private chefs and food trucks for a city from Supabase `profiles`.
 * Omits `is_active` if the column is not present (query without it on first failure).
 */
export async function loadProvidersForCity(citySlug: string): Promise<{
  chefs: ProviderSummary[];
  trucks: ProviderSummary[];
}> {
  try {
    const sb = getSupabaseServiceRole();
    const baseChefs = () =>
      sb
        .from('profiles')
        .select(
          'id, display_name, bio, cuisine_categories, obi_score, review_count, is_verified, rate_per_hour, provider_type',
        )
        .eq('provider_type', 'private_chef')
        .eq('city_slug', citySlug);

    const baseTrucks = () =>
      sb
        .from('profiles')
        .select(
          'id, display_name, truck_name, bio, cuisine_categories, max_capacity, obi_score, review_count, is_verified, rate_per_hour, provider_type',
        )
        .eq('provider_type', 'food_truck')
        .eq('city_slug', citySlug);

    let chefsRes = await baseChefs().eq('is_active', true);
    if (chefsRes.error?.message?.toLowerCase().includes('column')) {
      chefsRes = await baseChefs();
    }
    let trucksRes = await baseTrucks().eq('is_active', true);
    if (trucksRes.error?.message?.toLowerCase().includes('column')) {
      trucksRes = await baseTrucks();
    }

    if (chefsRes.error) {
      // eslint-disable-next-line no-console
      console.warn('[conciergeAgent] chefs query', chefsRes.error.message);
    }
    if (trucksRes.error) {
      // eslint-disable-next-line no-console
      console.warn('[conciergeAgent] trucks query', trucksRes.error.message);
    }

    const mapChef = (r: Record<string, unknown>): ProviderSummary => ({
      id: String(r.id ?? ''),
      displayName: String(r.display_name ?? 'Chef'),
      providerType: 'private_chef',
      cuisineCategories: Array.isArray(r.cuisine_categories)
        ? (r.cuisine_categories as string[])
        : [],
      ratePerHour: typeof r.rate_per_hour === 'number' ? r.rate_per_hour : null,
      obiScore: typeof r.obi_score === 'number' ? r.obi_score : null,
      reviewCount: typeof r.review_count === 'number' ? r.review_count : null,
      isVerified: typeof r.is_verified === 'boolean' ? r.is_verified : null,
      bio: typeof r.bio === 'string' ? r.bio : null,
    });

    const mapTruck = (r: Record<string, unknown>): ProviderSummary => ({
      id: String(r.id ?? ''),
      displayName: String(r.display_name ?? 'Food truck'),
      providerType: 'food_truck',
      truckName: typeof r.truck_name === 'string' ? r.truck_name : undefined,
      cuisineCategories: Array.isArray(r.cuisine_categories)
        ? (r.cuisine_categories as string[])
        : [],
      ratePerHour: typeof r.rate_per_hour === 'number' ? r.rate_per_hour : null,
      obiScore: typeof r.obi_score === 'number' ? r.obi_score : null,
      reviewCount: typeof r.review_count === 'number' ? r.review_count : null,
      isVerified: typeof r.is_verified === 'boolean' ? r.is_verified : null,
      bio: typeof r.bio === 'string' ? r.bio : null,
    });

    const chefs = (chefsRes.data ?? []).map((row) => mapChef(row as Record<string, unknown>));
    const trucks = (trucksRes.data ?? []).map((row) => mapTruck(row as Record<string, unknown>));

    return { chefs, trucks };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[conciergeAgent] loadProvidersForCity', e);
    return { chefs: [], trucks: [] };
  }
}

export async function generateConciergePackage(brief: ConciergeBriefInput): Promise<ConciergePackageResult> {
  const scaleGuidance: Record<EventScale, string> = {
    intimate:
      'For this intimate event (≤20 guests), prefer private chefs unless the buyer description suggests otherwise.',
    gathering:
      'For this mid-size gathering (21–75 guests), consider either private chefs or food trucks based on the event type and cuisine preferences.',
    large:
      'For this large event (76+ guests), prefer food trucks or a combination. A single private chef is not practical at this scale.',
  };

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  const model =
    process.env.ANTHROPIC_CONCIERGE_MODEL?.trim() ??
    process.env.ANTHROPIC_MODEL?.trim() ??
    'claude-sonnet-4-20250514';

  const prompt = `You are an event planning concierge for SpiceKrewe in ${brief.cityDisplayName}.

Buyer event brief:
- Event type: ${brief.eventType}
- Guest count: ${brief.guestCount}
- Event scale: ${brief.eventScale}
- Theme: ${brief.theme ?? 'no specific theme'}
- Budget: $${(brief.budgetCents / 100).toFixed(2)} total (cents budget: ${brief.budgetCents})
- Date: ${brief.eventDate ?? 'flexible'}
- Location: ${brief.locationNotes ?? `${brief.cityDisplayName} area`}

Scale guidance: ${scaleGuidance[brief.eventScale]}

PRIVATE CHEFS (${brief.chefs.length} available):
${formatProviderList(brief.chefs, 'private chef')}

FOOD TRUCKS (${brief.trucks.length} available):
${formatProviderList(brief.trucks, 'food truck')}

Select 2–4 providers whose combined services fit the budget. Each selection must use a provider id from the lists above.

Respond ONLY with valid JSON, no markdown fences:
{"packageItems":[{"providerId":"","providerName":"","providerType":"private_chef","serviceType":"","estimatedCostCents":0,"notes":""}],"estimatedTotalCents":0,"packageNarrative":""}

Rules:
- Sum of estimatedCostCents must not exceed budgetCents.
- providerType is "private_chef" or "food_truck".
- estimatedTotalCents is the sum of line estimates.`;

  if (!apiKey) {
    const pool = [...brief.chefs, ...brief.trucks].slice(0, 4);
    const pick = pool.slice(0, Math.min(3, Math.max(1, pool.length)));
    const packageItems: PackageItem[] = pick.map((p) => ({
      providerId: p.id,
      providerName: p.displayName,
      providerType: p.providerType,
      serviceType: p.providerType === 'food_truck' ? 'food_truck_service' : 'private_chef_service',
      estimatedCostCents: Math.min(
        Math.floor(brief.budgetCents / Math.max(1, pick.length)),
        brief.budgetCents,
      ),
      notes: 'Auto suggestion (set ANTHROPIC_API_KEY for Claude)',
    }));
    const estimatedTotalCents = packageItems.reduce((s, i) => s + i.estimatedCostCents, 0);
    return {
      packageItems,
      estimatedTotalCents,
      packageNarrative:
        'Suggested lineup from available providers (development fallback without ANTHROPIC_API_KEY).',
      requiresHumanReview: estimatedTotalCents > HUMAN_REVIEW_TOTAL_CENTS,
      eventScale: brief.eventScale,
    };
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Concierge AI error ${res.status}: ${err}`);
  }

  const body = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = body.content?.find((c) => c.type === 'text')?.text ?? '';
  const parsed = extractJsonObject(text.replace(/```json|```/g, ''));
  if (!parsed) {
    throw new Error('Concierge AI returned non-JSON');
  }

  const rawItems = Array.isArray(parsed.packageItems) ? parsed.packageItems : [];
  const packageItems: PackageItem[] = rawItems
    .map((row) => {
      const r = row as Record<string, unknown>;
      const est = Number(r.estimatedCostCents);
      const ptRaw = String(r.providerType ?? 'private_chef');
      const providerType: 'private_chef' | 'food_truck' = ptRaw === 'food_truck' ? 'food_truck' : 'private_chef';
      return {
        providerId: String(r.providerId ?? ''),
        providerName: String(r.providerName ?? ''),
        providerType,
        serviceType: String(r.serviceType ?? 'culinary'),
        estimatedCostCents: Number.isFinite(est) ? Math.max(0, Math.floor(est)) : 0,
        notes: r.notes != null ? String(r.notes) : undefined,
      };
    })
    .filter((i) => i.providerId.length > 0);

  const estimatedTotalCents = Number.isFinite(Number(parsed.estimatedTotalCents))
    ? Math.max(0, Math.floor(Number(parsed.estimatedTotalCents)))
    : packageItems.reduce((s, i) => s + i.estimatedCostCents, 0);

  const packageNarrative =
    typeof parsed.packageNarrative === 'string'
      ? parsed.packageNarrative
      : 'Your SpiceKrewe concierge package is ready.';

  const requiresHumanReview = estimatedTotalCents > HUMAN_REVIEW_TOTAL_CENTS;

  return {
    packageItems,
    estimatedTotalCents,
    packageNarrative,
    requiresHumanReview,
    eventScale: brief.eventScale,
  };
}
