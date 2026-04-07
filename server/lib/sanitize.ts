/**
 * Minimal text sanitization for API inputs (strip tags, cap length).
 */

export function sanitizeText(input: string, maxLength: number): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeBrief(input: {
  client_name: string;
  client_email: string;
  project_title: string;
  budget_range: string;
  timeline: string;
  description: string;
  required_skills: string;
}): {
  client_name: string;
  client_email: string;
  project_title: string;
  budget_range: string;
  timeline: string;
  description: string;
  required_skills: string;
} {
  return {
    client_name: sanitizeText(input.client_name, 200),
    client_email: sanitizeText(input.client_email, 200),
    project_title: sanitizeText(input.project_title, 200),
    budget_range: sanitizeText(input.budget_range, 200),
    timeline: sanitizeText(input.timeline, 200),
    description: sanitizeText(input.description, 5000),
    required_skills: sanitizeText(input.required_skills, 2000),
  };
}
