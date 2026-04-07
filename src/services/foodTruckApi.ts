const origin = import.meta.env.VITE_APP_ORIGIN?.replace(/\/$/, '') ?? '';
const API_BASE = origin ? `${origin}/api` : '/api';

export type FoodTruckSearchParams = {
  citySlug: string;
  cuisine?: string;
  headcount?: number;
};

export type FoodTruckSearchResultRow = {
  id: string;
  display_name?: string | null;
  truck_name?: string | null;
  cuisine_categories?: string[] | null;
  max_capacity?: number | null;
  city_slug?: string | null;
  provider_type?: string | null;
  health_permit_verified?: boolean | null;
  obi_score?: number | null;
  review_count?: number | null;
  is_verified?: boolean | null;
};

/**
 * Food-truck-specific API surface — keeps bookingApi focused on private-chef flows.
 */
export async function searchFoodTrucksByCuisine(
  params: FoodTruckSearchParams,
): Promise<FoodTruckSearchResultRow[]> {
  const q = new URLSearchParams({ citySlug: params.citySlug });
  if (params.cuisine) q.set('cuisineType', params.cuisine);
  if (params.headcount != null) q.set('minCapacity', String(params.headcount));
  const res = await fetch(`${API_BASE}/food-trucks-search?${q.toString()}`);
  if (res.status === 404) {
    return [];
  }
  if (!res.ok) {
    throw new Error(`foodTruck search failed: ${res.status}`);
  }
  const body = (await res.json()) as { results?: FoodTruckSearchResultRow[] };
  return body.results ?? [];
}

export async function fetchFoodTruckProviderRow(
  providerId: string,
  citySlug: string,
): Promise<FoodTruckSearchResultRow | null> {
  const rows = await searchFoodTrucksByCuisine({ citySlug });
  return rows.find((r) => r.id === providerId) ?? null;
}

export async function checkTruckCapacity(
  truckId: string,
  headcount: number,
): Promise<{
  ok: boolean;
  max: number;
  providerId: string;
  canServe: boolean;
  minimumBookingDuration: number;
  requiresPowerHookup: boolean;
  serviceRadius: string;
}> {
  const q = new URLSearchParams({ providerId: truckId, headcount: String(headcount) });
  const res = await fetch(`${API_BASE}/food-trucks-capacity?${q.toString()}`);
  if (res.status === 404) {
    return {
      ok: headcount <= 500,
      max: 500,
      providerId: truckId,
      canServe: headcount <= 500,
      minimumBookingDuration: 2,
      requiresPowerHookup: false,
      serviceRadius: '25 miles',
    };
  }
  if (!res.ok) {
    throw new Error(`capacity check failed: ${res.status}`);
  }
  const j = (await res.json()) as {
    providerId: string;
    maxCapacity: number;
    canServe: boolean;
    minimumBookingDuration: number;
    requiresPowerHookup: boolean;
    serviceRadius: string;
  };
  return {
    ok: j.canServe,
    max: j.maxCapacity,
    providerId: j.providerId,
    canServe: j.canServe,
    minimumBookingDuration: j.minimumBookingDuration,
    requiresPowerHookup: j.requiresPowerHookup,
    serviceRadius: j.serviceRadius,
  };
}

export async function fetchTruckAvailability(
  truckId: string,
  dateIso: string,
  durationHours?: number,
): Promise<{
  providerId: string;
  date: string;
  isAvailable: boolean;
  confirmedBookings: number;
  note?: string;
}> {
  const q = new URLSearchParams({ providerId: truckId, date: dateIso });
  if (durationHours != null) q.set('duration', String(durationHours));
  const res = await fetch(`${API_BASE}/food-trucks-availability?${q.toString()}`);
  if (res.status === 404) {
    return { providerId: truckId, date: dateIso, isAvailable: true, confirmedBookings: 0 };
  }
  if (!res.ok) {
    throw new Error(`availability failed: ${res.status}`);
  }
  return (await res.json()) as {
    providerId: string;
    date: string;
    isAvailable: boolean;
    confirmedBookings: number;
    note?: string;
  };
}

export type FoodTruckBookingPayload = {
  truckId: string;
  citySlug: string;
  buyerId: string;
  headcount: number;
  /** ISO date string (date portion used for booking) */
  eventStart: string;
  durationHours: number;
  eventDescription: string;
  locationAddress: string;
  notes?: string;
};

export async function submitFoodTruckBooking(
  payload: FoodTruckBookingPayload,
): Promise<{ bookingId: string | null; clientSecret: string | null; amount: number; platformFee: number }> {
  const date = payload.eventStart.slice(0, 10);
  const res = await fetch(`${API_BASE}/food-trucks-book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      providerId: payload.truckId,
      buyerId: payload.buyerId,
      date,
      duration: payload.durationHours,
      headcount: payload.headcount,
      eventDescription: payload.eventDescription || payload.notes || '',
      locationAddress: payload.locationAddress,
      citySlug: payload.citySlug,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`food truck booking failed: ${res.status} ${text}`);
  }
  return (await res.json()) as {
    bookingId: string | null;
    clientSecret: string | null;
    amount: number;
    platformFee: number;
  };
}
