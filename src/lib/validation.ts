import { z, ZodError } from 'zod';

/** Hire Flow / project brief payload — validated before persistence or AI handoff. */
export const HireBriefSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(200),
  /** Required for post-payment email; also stored as `client_email` on the brief row. */
  clientEmail: z.string().min(1, 'Email is required').email('Enter a valid email address').max(320),
  projectTitle: z.string().min(1, 'Project title is required').max(300),
  budgetRange: z.string().min(1, 'Budget range is required').max(120),
  timeline: z.string().min(1, 'Timeline is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(8000),
  requiredSkills: z
    .array(z.string().min(1).max(80))
    .min(1, 'Add at least one required skill or specialty')
    .max(24),
  /** Talent IDs the client marked as primary interest (matchmaker / directory). */
  primaryInterestTalentIds: z.array(z.string().min(1).max(120)).max(5).optional().default([]),
  /** Pre-filled from hire deep link `?talentId=`. */
  sourceTalentId: z.string().min(1).max(120).optional(),
});

export type HireBriefInput = z.infer<typeof HireBriefSchema>;

/**
 * Maps Zod failures to a single human-readable message (Flomisma marketplace register pattern).
 */
export function formatZodErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues.map((x) => x.message).join('; ');
  }
  return 'Invalid input';
}

/**
 * Safe parse for JSON bodies or form aggregates. Returns data or a formatted message.
 */
export function parseHireBrief(
  input: unknown,
): { ok: true; data: HireBriefInput } | { ok: false; message: string } {
  try {
    const data = HireBriefSchema.parse(input);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: formatZodErrorMessage(e) };
  }
}
