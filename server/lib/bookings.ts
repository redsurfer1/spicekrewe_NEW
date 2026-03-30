import { randomUUID } from 'node:crypto';
import type { Result } from './result';
import { getSupabaseServiceRole } from './supabase';

/**
 * Ensures a `bookings` row exists for a brief (used for onboarding + match feedback).
 * Returns `secureToken` for G14 signed feedback URLs.
 */
export async function ensureBookingForBrief(
  briefId: string,
): Promise<Result<{ bookingId: string; secureToken: string }, Error>> {
  const id = briefId?.trim();
  if (!id) {
    return { success: false, error: new Error('briefId is required') };
  }
  const sb = getSupabaseServiceRole();
  const { data: existing, error: selErr } = await sb
    .from('bookings')
    .select('id, secure_token')
    .eq('brief_id', id)
    .maybeSingle();
  if (selErr) {
    return { success: false, error: new Error(selErr.message) };
  }
  const row = existing as { id?: string; secure_token?: string | null } | null;
  if (row?.id && row.secure_token) {
    return { success: true, data: { bookingId: row.id, secureToken: row.secure_token } };
  }
  if (row?.id && !row.secure_token) {
    const newTok = randomUUID();
    const { data: patched, error: patchErr } = await sb
      .from('bookings')
      .update({ secure_token: newTok })
      .eq('id', row.id)
      .select('id, secure_token')
      .single();
    if (!patchErr && patched && (patched as { secure_token?: string }).secure_token) {
      return {
        success: true,
        data: {
          bookingId: row.id,
          secureToken: String((patched as { secure_token: string }).secure_token),
        },
      };
    }
    return {
      success: false,
      error: new Error(patchErr?.message ?? 'Could not assign secure_token to booking'),
    };
  }
  const { data: inserted, error: insErr } = await sb
    .from('bookings')
    .insert({ brief_id: id, status: 'open' })
    .select('id, secure_token')
    .single();
  if (insErr) {
    return { success: false, error: new Error(insErr.message) };
  }
  const rec = inserted as { id?: string; secure_token?: string | null };
  if (!rec?.id || !rec.secure_token) {
    return { success: false, error: new Error('Supabase returned no booking id or secure_token') };
  }
  return { success: true, data: { bookingId: rec.id, secureToken: rec.secure_token } };
}

export async function closeBookingForBrief(briefId: string): Promise<Result<void, Error>> {
  const id = briefId?.trim();
  if (!id) {
    return { success: false, error: new Error('briefId is required') };
  }
  const sb = getSupabaseServiceRole();
  const { error } = await sb
    .from('bookings')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('brief_id', id);
  if (error) {
    return { success: false, error: new Error(error.message) };
  }
  return { success: true, data: undefined };
}
