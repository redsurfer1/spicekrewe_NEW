/**
 * Strip characters that are risky for XSS / log injection in short text fields
 * before persistence (Supabase). Does not replace full HTML encoding — use for
 * ProjectTitle / ClientName only; long descriptions are validated separately.
 */
export function sanitizeBriefShortText(input: string, maxLen: number): string {
  const s = String(input ?? '')
    .replace(/\r\n/g, '\n')
    // Strip ASCII control characters except common whitespace (\t, \n, \r)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    .replace(/[<>]/g, '')
    .trim();
  return s.slice(0, maxLen);
}
