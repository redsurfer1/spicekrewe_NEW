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
    role: 'Executive Chef & Operations Consultant',
    specialty: 'Menu engineering, kitchen systems, and team leadership',
    tags: ['Menu Design', 'Private Chef', 'Recipe Development'],
    bio: 'Former hotel executive chef turned independent consultant. Marcus helps brands launch concepts, tighten food cost, and train brigades without losing soul in the plate.',
  },
  {
    id: 'aisha-thompson',
    name: 'Aisha Thompson',
    role: 'Recipe Developer & R&D Lead',
    specialty: 'Scalable formulations, allergen-aware menus, and co-packer handoffs',
    tags: ['Recipe Development', 'Flavor Consulting', 'Culinary Content'],
    bio: 'Aisha bridges CPG and restaurant R&D: she writes specs, runs bench tests, and documents processes so your product tastes the same at line 1 and line 100.',
  },
  // slug generated via generateSlug(name) — do not manually edit the slug without also updating vercel.json redirects for the old slug.
  {
    id: 'rafael-cruz',
    name: 'Rafael Cruz',
    role: 'Food Stylist & Photo/Video Partner',
    specialty: 'Editorial, e‑commerce, and campaign shoots with motion',
    tags: ['Food Styling', 'Culinary Content'],
    bio: 'Rafael crafts hero shots and short-form content for national brands. His sets stay efficient, on-brief, and edible-safe from first frame to wrap.',
  },
  // slug generated via generateSlug(name) — do not manually edit the slug without also updating vercel.json redirects for the old slug.
  {
    id: 'dana-nguyen',
    name: 'Dana Nguyen',
    role: 'Flavor Consultant & Sensory Strategist',
    specialty: 'Tasting panels, flavor maps, and cross-cultural menu balance',
    tags: ['Flavor Consulting', 'Menu Design', 'Recipe Development'],
    bio: 'Dana blends sensory science with street-level intuition—helping teams articulate “why this works” and ship flavors that resonate in multiple markets.',
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
