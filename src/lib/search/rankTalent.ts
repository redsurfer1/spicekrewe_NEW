import type { TalentRecord } from '../../types/talentRecord';

export type ProviderTypeFilter = 'all' | 'private_chef' | 'food_truck';

/** Boost verified + higher OBV; optional providerType keeps chef vs food truck cohorts separate. */
export function rankTalentResults(rows: TalentRecord[], providerType: ProviderTypeFilter): TalentRecord[] {
  const scoped =
    providerType === 'all'
      ? rows
      : rows.filter((r) => (r.providerType ?? 'private_chef') === providerType);

  return [...scoped].sort((a, b) => {
    const va = a.verified ? 1 : 0;
    const vb = b.verified ? 1 : 0;
    if (va !== vb) return vb - va;
    const oa = a.obvScore ?? a.rating * 20;
    const ob = b.obvScore ?? b.rating * 20;
    if (oa !== ob) return ob - oa;
    return b.reviews - a.reviews;
  });
}
