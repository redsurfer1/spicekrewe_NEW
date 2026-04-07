/**
 * SpiceKrewe culinary subscriptions (Explorer / Enthusiast). City-scoped credits.
 * Native SpiceKrewe subscription service.
 */

export type SubscriptionTier = 'explorer' | 'enthusiast';

export type SubscriberContext = {
  buyerId: string;
  citySlug: string;
  tier: SubscriptionTier;
};

export async function getSubscriberSnapshot(ctx: SubscriberContext): Promise<{ creditsRemaining: number }> {
  void ctx;
  return { creditsRemaining: 0 };
}

export type BookClassParams = {
  buyerId: string;
  citySlug: string;
  /** Use private_chef for tastings / in-home; food_truck for large-format service */
  providerType: 'private_chef' | 'food_truck';
  providerId: string;
  slotStart: string;
};

export async function bookClass(params: BookClassParams): Promise<{ bookingId: string }> {
  void params;
  throw new Error('bookClass: subscription debit not yet implemented');
}
