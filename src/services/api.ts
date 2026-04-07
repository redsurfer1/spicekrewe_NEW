const origin = import.meta.env.VITE_APP_ORIGIN?.replace(/\/$/, '') ?? '';
const API_BASE_URL = origin ? `${origin}/api` : '/api';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  lead_source?: string;
}

interface NewsletterData {
  email: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const api = {
  async submitContactForm(data: ContactFormData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Contact form submission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit form',
      };
    }
  },

  /** No server route for `/api/newsletter/subscribe` in narrow model — optimistic client stub. */
  async subscribeNewsletter(_data: NewsletterData): Promise<ApiResponse> {
    void _data;
    return Promise.resolve({ success: true, message: "Thanks — you're on the list." });
  },

  /** No server route for `/api/events` — retained callers get an empty list (Events uses static copy). */
  async getEvents(): Promise<ApiResponse<unknown[]>> {
    return Promise.resolve({ success: true, data: [] });
  },

  /** No server route for `/api/content` — About falls back to bundled default copy when `data` is absent. */
  async getContent(): Promise<ApiResponse> {
    return Promise.resolve({ success: true });
  },
};

export type ConciergeSubmitBody = {
  tenantId: string;
  citySlug: string;
  buyerId: string;
  eventType: string;
  guestCount: number;
  theme?: string;
  budgetCents: number;
  eventDate?: string;
  locationNotes?: string;
};

export async function submitConciergeBrief(
  brief: ConciergeSubmitBody,
): Promise<
  ApiResponse<{
    briefId: string;
    status: string;
    package?: {
      id: string;
      eventScale?: 'intimate' | 'gathering' | 'large';
      packageItems?: Array<{
        providerId: string;
        providerName: string;
        providerType?: 'private_chef' | 'food_truck';
        serviceType: string;
        estimatedCostCents: number;
        notes?: string;
      }>;
      estimatedTotalCents?: number;
      packageNarrative?: string;
    };
    conciergeFee?: string;
    eventScale?: 'intimate' | 'gathering' | 'large';
    message?: string;
  }>
> {
  try {
    const response = await fetch(`${API_BASE_URL}/concierge-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(brief),
    });
    const json = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      return {
        success: false,
        error: (json.error as string) ?? `HTTP ${response.status}`,
      };
    }
    return {
      success: true,
      data: json as {
        briefId: string;
        status: string;
        package?: {
          id: string;
          eventScale?: 'intimate' | 'gathering' | 'large';
          packageItems?: Array<{
            providerId: string;
            providerName: string;
            providerType?: 'private_chef' | 'food_truck';
            serviceType: string;
            estimatedCostCents: number;
            notes?: string;
          }>;
          estimatedTotalCents?: number;
          packageNarrative?: string;
        };
        conciergeFee?: string;
        eventScale?: 'intimate' | 'gathering' | 'large';
        message?: string;
      },
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Concierge submit failed',
    };
  }
}

export async function acceptConciergePackage(
  briefId: string,
  packageId: string,
  buyerId: string,
): Promise<ApiResponse<{ success?: boolean; briefId?: string; providersNotified?: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/concierge-accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ briefId, packageId, buyerId }),
    });
    const json = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      return { success: false, error: (json.error as string) ?? `HTTP ${response.status}` };
    }
    return {
      success: true,
      data: {
        success: json.success === true,
        briefId: json.briefId as string | undefined,
        providersNotified: typeof json.providersNotified === 'number' ? json.providersNotified : undefined,
      },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Accept failed' };
  }
}

export async function respondToBooking(
  briefId: string,
  providerId: string,
  action: 'accept' | 'decline',
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/concierge-provider-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ briefId, providerId, action }),
    });
    const json = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      return { success: false, error: (json.error as string) ?? `HTTP ${response.status}` };
    }
    return { success: true, data: json };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Provider response failed' };
  }
}
