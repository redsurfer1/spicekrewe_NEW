import { z } from 'zod';

/**
 * G12/G13 — Machine-readable Flavor Intelligence (matchmaker) contract.
 * Server-authoritative scoring lives in `server/lib/matchmakerAlerts.ts` and related services;
 * client `src/lib/ai/matchmaker.ts` must not drift from this shape for API consumers.
 */

export const flavorMatchRecommendationSchema = z.object({
  professionalId: z.string().min(1),
  name: z.string().min(1),
  reason: z.string().min(1),
});

export const flavorMatchmakerResponseSchema = z.object({
  matches: z.array(flavorMatchRecommendationSchema),
});

export type FlavorMatchRecommendation = z.infer<typeof flavorMatchRecommendationSchema>;
export type FlavorMatchmakerResponse = z.infer<typeof flavorMatchmakerResponseSchema>;

export function parseFlavorMatchmakerResponse(raw: unknown): FlavorMatchmakerResponse {
  return flavorMatchmakerResponseSchema.parse(raw);
}
