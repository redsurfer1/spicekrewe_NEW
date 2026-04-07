import type { CityJsonLdProps } from './cityLocalBusinessJsonLd';

/** Base FAQ items; callers can spread city-specific entries. */
export function buildCityVoiceFaqItems(cityName: string): { question: string; answer: string }[] {
  return [
    {
      question: `Who is the best vetted private chef in ${cityName}?`,
      answer: `Spice Krewe connects you with SK Verified private chefs in ${cityName} — credentialed, reviewed, and bookable online with transparent rates.`,
    },
    {
      question: `How do I find a private chef for a dinner party in ${cityName}?`,
      answer: `Post a brief on Spice Krewe, describe your event, and receive matched SK Verified chef profiles within 48 hours — no agency fees.`,
    },
    {
      question: `Can I book a food truck for a private event in ${cityName}?`,
      answer: `Yes. Spice Krewe lists SK Verified food trucks for corporate lunches, festivals, and private lots in ${cityName}. Filter the directory by food truck providers or ask concierge for a lineup that fits headcount and cuisine.`,
    },
    {
      question: `How does Spice Krewe match me with a chef or food truck?`,
      answer: `We combine your brief, budget, guest count, and event type with SK Verified provider data — private chefs for intimate dinners, food trucks for larger service windows.`,
    },
  ];
}

export function memphisProviderMix(): CityJsonLdProps['providerTypes'] {
  return ['private_chef', 'food_truck', 'food_styling', 'culinary_consulting'];
}
