/**
 * OBV tier ladder — Flomisma engine OBV tier thresholds.
 * Score is platform OBV; engagementCount is completed bookings / milestones (tenant-defined).
 */

export type ObvTier = 'new' | 'rising' | 'established' | 'expert' | 'elite';

export type ObvTierInfo = {
  tier: ObvTier;
  label: string;
  minScore: number;
  minEngagement: number;
};

export const OBV_TIERS: ObvTierInfo[] = [
  { tier: 'new', label: 'New', minScore: 0, minEngagement: 0 },
  { tier: 'rising', label: 'Rising', minScore: 35, minEngagement: 2 },
  { tier: 'established', label: 'Established', minScore: 55, minEngagement: 6 },
  { tier: 'expert', label: 'Expert', minScore: 72, minEngagement: 15 },
  { tier: 'elite', label: 'Elite', minScore: 85, minEngagement: 30 },
];

/** SpiceKrewe public badge copy (culinary tier names — same thresholds as OBV_TIERS). */
export const CULINARY_BADGE_TIERS: Record<ObvTier, string> = {
  new: 'Apprentice',
  rising: 'Journeyman',
  established: 'Craftsman',
  expert: 'Chef de Partie',
  elite: 'Executive Chef',
};

export function getObvTier(score: number, engagementCount: number): ObvTierInfo {
  let matched: ObvTierInfo = OBV_TIERS[0];
  for (const row of OBV_TIERS) {
    if (score >= row.minScore && engagementCount >= row.minEngagement) {
      matched = row;
    }
  }
  return matched;
}

export function getCulinaryBadgeLabel(tier: ObvTier): string {
  return CULINARY_BADGE_TIERS[tier] ?? CULINARY_BADGE_TIERS.new;
}
