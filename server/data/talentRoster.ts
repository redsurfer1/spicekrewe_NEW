/**
 * Server-side roster for predictive matchmaking.
 * Keep in sync with `src/data/talent.ts` → `TALENT_FALLBACK` (ids, names, tags, role, specialty, bio).
 */
export type ServerTalentRecord = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  tags: string[];
  bio: string;
};

/** Mirror of `TALENT_FALLBACK` for scoring (no client-only fields). */
export const PROFESSIONAL_ROSTER: ServerTalentRecord[] = [
  // slug generated via generateSlug(name) — do not manually edit the slug without also updating vercel.json redirects for the old slug.
  {
    id: 'marcus-johnson',
    name: 'Marcus Johnson',
    role: 'Estate & Executive Private Chef',
    specialty: 'Specializing in multi-course fine dining, formal events, and full-service household culinary management.',
    tags: ['Fine Dining', 'Formal Events', 'Menu Design'],
    bio: 'Former hotel executive chef turned independent consultant. Marcus helps brands launch concepts, tighten food cost, and train brigades without losing soul in the plate.',
  },
  {
    id: 'aisha-thompson',
    name: 'Aisha Thompson',
    role: 'Wellness & Performance Private Chef',
    specialty: 'Focus on specialized dietary protocols, athletic nutrition, and allergen-aware family meal preparation.',
    tags: ['Dietary Specs', 'Performance Nutrition', 'Meal Prep'],
    bio: 'Aisha bridges performance science and everyday family cooking — she designs precise protocols and builds lasting household nutrition systems.',
  },
  // slug generated via generateSlug(name) — do not manually edit the slug without also updating vercel.json redirects for the old slug.
  {
    id: 'rafael-cruz',
    name: 'Rafael Cruz',
    role: 'Boutique Event & Social Chef',
    specialty: 'Curating intimate social gatherings and interactive tasting experiences with a seasonal, farm-to-table approach.',
    tags: ['Intimate Events', 'Seasonal Menus', 'Farm-to-Table'],
    bio: 'Rafael designs social dining experiences that feel personal and unhurried — sourcing locally, building menus around the season, and turning a dinner into a memory.',
  },
  // slug generated via generateSlug(name) — do not manually edit the slug without also updating vercel.json redirects for the old slug.
  {
    id: 'dana-nguyen',
    name: 'Dana Nguyen',
    role: 'Global Fusion & Sensory Chef',
    specialty: 'Providing cross-cultural tasting menus and sensory-driven culinary experiences for discerning clients.',
    tags: ['Global Fusion', 'Tasting Menus', 'Sensory Mapping'],
    bio: 'Dana blends sensory science with cross-cultural intuition — building tasting experiences that feel both transportive and cohesive for discerning private clients.',
  },
  {
    id: 'mid-south-smoke-truck',
    name: 'Mid-South Smoke & Pickle',
    role: 'Food Truck — BBQ & Southern sides',
    specialty: 'Corporate lunches, festivals, and private lot service (Memphis / Mid-South)',
    tags: ['Food Truck', 'Private Chef'],
    bio: 'Wood-fired BBQ, vegetarian sides, and fast line service for 50–500 guests. Health permit and commissary on file.',
  },
];
