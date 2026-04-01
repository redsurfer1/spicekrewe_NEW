export function sanitizeString(input: string, maxLength = 5000): string {
  let out = input ?? '';
  // Strip HTML tags
  out = out.replace(/<[^>]*>/g, '');
  // Strip common XSS/script injection patterns
  out = out.replace(/javascript:/gi, '');
  out = out.replace(/onerror\s*=/gi, '');
  out = out.replace(/onload\s*=/gi, '');
  out = out.replace(/<\s*script/gi, '');
  out = out.replace(/<\/\s*script\s*>/gi, '');
  out = out.trim();
  if (out.length > maxLength) {
    out = out.slice(0, maxLength);
  }
  return out;
}

export function sanitizeEmail(input: string): string {
  const email = (input ?? '').trim().toLowerCase();
  // Simplified RFC 5322-compatible email regex
  const re =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
  if (!re.test(email)) {
    throw new Error('Invalid email format');
  }
  return email;
}

export type SanitizedBrief = {
  client_name: string;
  client_email: string;
  project_title: string;
  budget_range: string;
  timeline: string;
  description: string;
  required_skills: string;
};

export function sanitizeBrief(raw: Record<string, unknown>): SanitizedBrief {
  const client_name = sanitizeString(String(raw.client_name ?? ''), 200);
  const project_title = sanitizeString(String(raw.project_title ?? ''), 200);
  const description = sanitizeString(String(raw.description ?? ''), 5000);
  const required_skills = sanitizeString(String(raw.required_skills ?? ''), 1000);
  const timeline = sanitizeString(String(raw.timeline ?? ''), 500);
  const client_email = sanitizeEmail(String(raw.client_email ?? ''));

  const budget_raw = String(raw.budget_range ?? '').trim();
  // Very simple budget pattern like "$500-$1000" or "$500"
  const budgetRe = /^\$\d[\d,]*(\s*-\s*\$\d[\d,]*)?$/;
  if (!budgetRe.test(budget_raw)) {
    throw new Error('Invalid budget range format');
  }

  return {
    client_name,
    client_email,
    project_title,
    budget_range: budget_raw,
    timeline,
    description,
    required_skills,
  };
}

export type SanitizedProfile = {
  display_name?: string;
  bio?: string;
  specialty?: string;
  location?: string;
  website_url?: string | null;
  avatar_url?: string | null;
  hourly_rate?: number | null;
};

function validateHttpsUrl(raw: unknown): string | null {
  const val = typeof raw === 'string' ? raw.trim() : '';
  if (!val) return null;
  try {
    const url = new URL(val);
    if (url.protocol !== 'https:') throw new Error('URL must use https');
    return url.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

export function sanitizeProfileUpdate(raw: Record<string, unknown>): SanitizedProfile {
  const out: SanitizedProfile = {};

  if (raw.display_name != null) {
    out.display_name = sanitizeString(String(raw.display_name), 100);
  }
  if (raw.bio != null) {
    out.bio = sanitizeString(String(raw.bio), 500);
  }
  if (raw.specialty != null) {
    out.specialty = sanitizeString(String(raw.specialty), 200);
  }
  if (raw.location != null) {
    out.location = sanitizeString(String(raw.location), 200);
  }
  if (raw.website_url != null) {
    out.website_url = validateHttpsUrl(raw.website_url);
  }
  if (raw.avatar_url != null) {
    out.avatar_url = validateHttpsUrl(raw.avatar_url);
  }
  if (raw.hourly_rate != null) {
    const n = Number(raw.hourly_rate);
    if (!Number.isInteger(n) || n <= 0 || n >= 100000) {
      throw new Error('Invalid hourly rate');
    }
    out.hourly_rate = n;
  }

  return out;
}

