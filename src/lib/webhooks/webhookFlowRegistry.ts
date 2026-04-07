/**
 * Stripe webhook dispatch by metadata.flow — Flomisma engine webhook pattern.
 * All payment types share one endpoint; handlers stay isolated per flow.
 */

export type WebhookFlowContext = {
  stripeEventId: string;
  rawObject: Record<string, unknown>;
};

export type WebhookFlowHandler = (ctx: WebhookFlowContext) => Promise<void>;

const registry = new Map<string, WebhookFlowHandler>();

export function registerWebhookFlow(flow: string, handler: WebhookFlowHandler): void {
  registry.set(flow, handler);
}

export async function dispatchWebhookFlow(
  flow: string | undefined,
  ctx: WebhookFlowContext,
): Promise<{ handled: boolean; flow: string }> {
  const key = (flow ?? '').trim();
  if (!key) {
    return { handled: false, flow: '' };
  }
  const fn = registry.get(key);
  if (!fn) {
    return { handled: false, flow: key };
  }
  await fn(ctx);
  return { handled: true, flow: key };
}

export function listRegisteredWebhookFlows(): string[] {
  return [...registry.keys()];
}
