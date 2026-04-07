/**
 * Security incident helper — writes to security_incidents when table exists.
 */

import { getSupabaseServiceRole } from './supabase.js';

export async function logSecurityIncident(params: {
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceIp?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const sb = getSupabaseServiceRole();
    await sb.from('security_incidents').insert({
      incident_type: params.incidentType,
      severity: params.severity,
      source_ip: params.sourceIp ?? null,
      details: params.details ?? {},
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[securityIncidents]', err);
  }
}
