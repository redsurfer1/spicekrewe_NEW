/**
 * Project brief writes — always via same-origin `/api/*` serverless routes.
 * Briefs are written only via `/api/*` using the server Supabase service role (SOC2 alignment).
 */

import type { Result } from './types/results';
import type { HireBriefInput } from './validation';

function apiPath(p: string): string {
  const base = import.meta.env.VITE_APP_ORIGIN?.replace(/\/$/, '') ?? '';
  return `${base}${p.startsWith('/') ? p : `/${p}`}`;
}

export async function submitProjectBrief(
  brief: HireBriefInput,
): Promise<Result<{ recordId: string }, Error>> {
  const requestId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : undefined;
  try {
    const res = await fetch(apiPath('/api/submit-brief'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(requestId ? { 'X-Request-Id': requestId } : {}),
      },
      body: JSON.stringify(brief),
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      return {
        success: false,
        error: new Error(
          res.ok ? 'Submit endpoint returned non-JSON' : `Brief submit failed (${res.status})`,
        ),
      };
    }

    if (!res.ok) {
      const msg =
        typeof json === 'object' && json !== null && 'error' in json
          ? String((json as { error?: unknown }).error)
          : text.slice(0, 200);
      return { success: false, error: new Error(msg || res.statusText) };
    }

    const recordId =
      typeof json === 'object' && json !== null && 'recordId' in json
        ? String((json as { recordId?: unknown }).recordId)
        : '';
    if (!recordId) {
      return { success: false, error: new Error('Server did not return recordId') };
    }
    return { success: true, data: { recordId } };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err };
  }
}

export async function patchBriefRecord(
  recordId: string,
  fields: Record<string, string | number | boolean>,
): Promise<Result<void, Error>> {
  try {
    const res = await fetch(apiPath('/api/patch-brief'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ recordId, fields }),
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      return {
        success: false,
        error: new Error(
          res.ok ? 'Patch endpoint returned non-JSON' : `Brief patch failed (${res.status})`,
        ),
      };
    }

    if (!res.ok) {
      const msg =
        typeof json === 'object' && json !== null && 'error' in json
          ? String((json as { error?: unknown }).error)
          : text.slice(0, 200);
      return { success: false, error: new Error(msg || res.statusText) };
    }
    return { success: true, data: undefined };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err };
  }
}
