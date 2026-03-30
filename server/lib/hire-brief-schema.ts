import { z } from 'zod';

/** Server-side mirror of `src/lib/validation.ts` HireBriefSchema — keep in sync. */
export const HireBriefSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(200),
  clientEmail: z.string().min(1, 'Email is required').email('Enter a valid email address').max(320),
  projectTitle: z.string().min(1, 'Project title is required').max(300),
  budgetRange: z.string().min(1, 'Budget range is required').max(120),
  timeline: z.string().min(1, 'Timeline is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(8000),
  requiredSkills: z
    .array(z.string().min(1).max(80))
    .min(1, 'Add at least one required skill or specialty')
    .max(24),
  primaryInterestTalentIds: z.array(z.string().min(1).max(120)).max(5).optional().default([]),
  sourceTalentId: z.string().min(1).max(120).optional(),
});

export type HireBriefInput = z.infer<typeof HireBriefSchema>;
