import { createHmac, timingSafeEqual } from 'node:crypto';

const PURPLE = '#4d2f91';
const BLUE = '#3275bd';

type ObvTier = 'new' | 'rising' | 'established' | 'expert' | 'elite';

const CULINARY_BADGE_TIERS: Record<ObvTier, string> = {
  new: 'Apprentice',
  rising: 'Journeyman',
  established: 'Craftsman',
  expert: 'Chef de Partie',
  elite: 'Executive Chef',
};

const TIERS: Array<{ tier: ObvTier; minScore: number; minEngagement: number }> = [
  { tier: 'new', minScore: 0, minEngagement: 0 },
  { tier: 'rising', minScore: 35, minEngagement: 2 },
  { tier: 'established', minScore: 55, minEngagement: 6 },
  { tier: 'expert', minScore: 72, minEngagement: 15 },
  { tier: 'elite', minScore: 85, minEngagement: 30 },
];

function getObvTier(score: number, engagementCount: number): { tier: ObvTier } {
  let matched: ObvTier = 'new';
  for (const row of TIERS) {
    if (score >= row.minScore && engagementCount >= row.minEngagement) {
      matched = row.tier;
    }
  }
  return { tier: matched };
}

function getCulinaryBadgeLabel(tier: ObvTier): string {
  return CULINARY_BADGE_TIERS[tier];
}

export function hashUserId(userId: string, secret: string): string {
  return createHmac('sha256', secret).update(userId).digest('hex').slice(0, 16);
}

export function verifyUserIdHmac(userId: string, token: string, secret: string): boolean {
  const expected = hashUserId(userId, secret);
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export type CredentialPayload = {
  userId: string;
  displayName: string;
  obvScore: number;
  engagementCount: number;
};

export function buildCredentialJson(payload: CredentialPayload, secret: string) {
  const tierInfo = getObvTier(payload.obvScore, payload.engagementCount);
  const tier = tierInfo.tier;
  const culinary = getCulinaryBadgeLabel(tier);
  return {
    userId: payload.userId,
    displayName: payload.displayName,
    tier,
    tierLabel: culinary,
    badgeTitle: `${culinary} — SpiceKrewe Verified`,
    hash: hashUserId(payload.userId, secret),
    score: payload.obvScore,
    engagement: payload.engagementCount,
  };
}

export function buildCredentialBadgeSvg(payload: CredentialPayload, secret: string): string {
  const data = buildCredentialJson(payload, secret);
  const title = 'SpiceKrewe Verified';
  const subtitle = data.badgeTitle;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="120" viewBox="0 0 360 120" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="skg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${PURPLE}"/>
      <stop offset="100%" stop-color="${BLUE}"/>
    </linearGradient>
  </defs>
  <rect width="360" height="120" rx="16" fill="url(#skg)"/>
  <text x="24" y="42" fill="#ffffff" font-size="20" font-family="Barlow Condensed, Arial, sans-serif" font-weight="700">${title}</text>
  <text x="24" y="72" fill="#e8e0ff" font-size="14" font-family="Barlow Condensed, Arial, sans-serif">${escapeXml(subtitle)}</text>
  <text x="24" y="98" fill="#d7dbff" font-size="11" font-family="monospace">id:${data.hash}</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
