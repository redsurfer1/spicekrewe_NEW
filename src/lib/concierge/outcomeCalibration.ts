export type OutcomeRow = {
  citySlug?: string | null;
  eventType?: string | null;
  guestCount?: number | null;
  providerTypes?: string[] | null;
  /** Legacy single-type field */
  providerType?: 'private_chef' | 'food_truck' | string | null;
  packageNarrative?: string | null;
  estimatedTotalCents?: number | null;
  budgetCents?: number | null;
};

/**
 * Summarizes recent concierge outcomes for Claude calibration (SpiceKrewe + food truck aware).
 */
export function formatOutcomeSummary(rows: OutcomeRow[], max = 8): string {
  const slice = rows.slice(0, max);
  if (!slice.length) return 'No recent concierge outcomes on file.';
  return slice
    .map((r, i) => {
      const city = r.citySlug ?? 'unknown-city';
      const event = r.eventType ?? 'event';
      const guests = typeof r.guestCount === 'number' ? r.guestCount : '?';
      const types =
        r.providerTypes?.length
          ? r.providerTypes
          : r.providerType
            ? [r.providerType]
            : ['mixed'];
      const budgetDollars =
        typeof r.budgetCents === 'number'
          ? (r.budgetCents / 100).toFixed(0)
          : typeof r.estimatedTotalCents === 'number'
            ? (r.estimatedTotalCents / 100).toFixed(0)
            : 'n/a';
      return `${i + 1}) Event: ${event}, Guests: ${guests}, Providers: ${types.join(' + ')}, Budget: $${budgetDollars} (${city})`;
    })
    .join('\n');
}

export function conciergePromptProviderPreamble(cityDisplayName: string): string {
  return `You are the Spice Krewe concierge in ${cityDisplayName}. Providers include SK Verified private chefs and food trucks. Use private chefs for intimate seated dinners; recommend food trucks when headcount, service style, or venue logistics favor mobile service (e.g., corporate lunch for 80+).`;
}
