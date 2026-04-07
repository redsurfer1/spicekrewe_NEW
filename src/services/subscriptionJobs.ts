/**
 * Cron-friendly jobs for SpiceKrewe subscribers — invoke from Vercel cron.
 */

export async function sendCreditExpiryReminders(): Promise<void> {
  // eslint-disable-next-line no-console
  console.info('[subscriptionJobs] sendCreditExpiryReminders — stub');
}

export async function sendEnthusiastPrivateSessionNudge(): Promise<void> {
  // eslint-disable-next-line no-console
  console.info('[subscriptionJobs] sendEnthusiastPrivateSessionNudge — stub');
}

export async function detectChurnSignal(): Promise<void> {
  // eslint-disable-next-line no-console
  console.info('[subscriptionJobs] detectChurnSignal — stub');
}
