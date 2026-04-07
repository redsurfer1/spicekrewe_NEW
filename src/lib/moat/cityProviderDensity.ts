export type ProviderCategoryKey =
  | 'private_chef'
  | 'food_truck'
  | 'food_styling'
  | 'recipe_development';

export type CityProviderDensityInput = {
  citySlug?: string;
  counts: Partial<Record<ProviderCategoryKey, number>>;
};

/** Minimum active listings per category before calling a city “launch ready”. */
const MIN_ACTIVE = {
  private_chef: 10,
  food_truck: 5,
  food_styling: 3,
  recipe_development: 3,
} as const;

export type MoatStrength = 'none' | 'forming' | 'solid' | 'strong';

export type CityDensityReport = {
  citySlug: string;
  totalProviders: number;
  privateChefCount: number;
  foodTruckCount: number;
  privateChefReady: boolean;
  foodTruckReady: boolean;
  ready: boolean;
  moatStrength: MoatStrength;
};

export function categoryCoverage(input: CityProviderDensityInput): Array<{
  category: ProviderCategoryKey;
  count: number;
  required: number;
  satisfied: boolean;
}> {
  return (Object.keys(MIN_ACTIVE) as ProviderCategoryKey[]).map((category) => {
    const count = input.counts[category] ?? 0;
    const required = MIN_ACTIVE[category];
    return { category, count, required, satisfied: count >= required };
  });
}

export function reportCityDensity(citySlug: string, input: CityProviderDensityInput): CityDensityReport {
  const privateChefCount = input.counts.private_chef ?? 0;
  const foodTruckCount = input.counts.food_truck ?? 0;
  const totalProviders = Object.values(input.counts).reduce((s, n) => s + (n ?? 0), 0);
  const privateChefReady = privateChefCount >= MIN_ACTIVE.private_chef;
  const foodTruckReady = foodTruckCount >= MIN_ACTIVE.food_truck;
  const ready = privateChefReady && foodTruckReady;
  return {
    citySlug,
    totalProviders,
    privateChefCount,
    foodTruckCount,
    privateChefReady,
    foodTruckReady,
    ready,
    moatStrength: moatStrength(input),
  };
}

/**
 * Moat strength requires both private chefs and food trucks at tier thresholds.
 */
export function moatStrength(input: CityProviderDensityInput): MoatStrength {
  const chefs = input.counts.private_chef ?? 0;
  const trucks = input.counts.food_truck ?? 0;
  const total = Object.values(input.counts).reduce((s, n) => s + (n ?? 0), 0);

  if (total < 5 || trucks === 0) {
    return 'none';
  }

  if (
    total >= 40 &&
    trucks >= 8 &&
    chefs >= 20
  ) {
    return 'strong';
  }

  if (
    total >= 20 &&
    trucks >= 5 &&
    chefs >= 10
  ) {
    return 'solid';
  }

  if (total >= 5 && total <= 19 && trucks >= 1) {
    return 'forming';
  }

  return 'forming';
}

export function isCityLaunchReady(input: CityProviderDensityInput): boolean {
  return reportCityDensity(input.citySlug ?? 'city', input).ready;
}
