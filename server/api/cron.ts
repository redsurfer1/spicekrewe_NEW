/**
 * Vercel cron dispatcher for SpiceKrewe automation jobs.
 * Core pattern: Flomisma engine.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  alertHumanReviewBacklog,
  autoDeclineUnresponsiveProviders,
  calculateProfileCompleteness,
  checkPermitExpiration,
  checkRevenueAnomaly,
  detectBookingConflicts,
  detectInactiveProviders,
  detectNoShows,
  enforceDataRetention,
  recoverAbandonedConciergeBriefs,
  sendCityPipelineReport,
  sendDailyOperatorDigest,
  sendEventReminders,
  sendPostEventReviewRequests,
  sendProfileCompletenessNudges,
  sendProviderFinalNudge,
  sendVerificationReminders,
} from '../lib/automationJobs.js';

async function runJob(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    // eslint-disable-next-line no-console
    console.log(`[cron] ${name} OK`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[cron] ${name} FAILED`, err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${secret}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay();
  const utcDate = now.getUTCDate();

  const jobs: Array<Promise<void>> = [];

  // Daily / hourly buckets (UTC)
  if (utcHour === 6) jobs.push(runJob('sendProviderFinalNudge', sendProviderFinalNudge));
  if (utcHour === 7) jobs.push(runJob('sendEventReminders', sendEventReminders));
  if (utcHour === 8) jobs.push(runJob('sendDailyOperatorDigest', sendDailyOperatorDigest));
  if (utcHour === 10) jobs.push(runJob('sendPostEventReviewRequests', sendPostEventReviewRequests));
  if (utcHour === 11) jobs.push(runJob('detectNoShows', detectNoShows));

  // Daily maintenance bundle (single UTC hour to avoid duplicate work on hourly cron)
  if (utcHour === 9) {
    jobs.push(runJob('calculateProfileCompleteness', calculateProfileCompleteness));
    jobs.push(runJob('sendVerificationReminders', sendVerificationReminders));
    jobs.push(runJob('checkPermitExpiration', checkPermitExpiration));
    jobs.push(runJob('detectBookingConflicts', detectBookingConflicts));
  }

  if (utcHour % 4 === 0) {
    jobs.push(runJob('autoDeclineUnresponsiveProviders', autoDeclineUnresponsiveProviders));
    jobs.push(runJob('alertHumanReviewBacklog', alertHumanReviewBacklog));
  }

  if (utcHour % 6 === 0) {
    jobs.push(runJob('recoverAbandonedConciergeBriefs', recoverAbandonedConciergeBriefs));
  }

  if (utcDay === 1) {
    jobs.push(runJob('sendProfileCompletenessNudges', sendProfileCompletenessNudges));
    jobs.push(runJob('detectInactiveProviders', detectInactiveProviders));
    jobs.push(runJob('checkRevenueAnomaly', checkRevenueAnomaly));
    jobs.push(runJob('sendCityPipelineReport', sendCityPipelineReport));
  }

  if (utcDate === 1) {
    jobs.push(runJob('enforceDataRetention', enforceDataRetention));
  }

  await Promise.all(jobs);

  res.status(200).json({ ok: true, ranAt: now.toISOString(), utcHour, utcDay, utcDate });
}
