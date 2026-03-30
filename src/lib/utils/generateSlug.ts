/**
 * Normalizes a display name into a URL-safe talent slug.
 *
 * @example generateSlug("Aisha Thompson") → "aisha-thompson"
 * @example generateSlug("Rafael Cruz") → "rafael-cruz"
 * @example generateSlug("Dana Nguyen") → "dana-nguyen"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
