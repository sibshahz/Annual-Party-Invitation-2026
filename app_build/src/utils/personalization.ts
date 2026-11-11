const MAX_PARAM_LENGTH = 80;

/**
 * Normalizes and sanitizes optional query parameters (?guest=... or ?batch=...).
 */
export function sanitizeQueryValue(raw: string | null): string {
  if (!raw) return '';
  return raw.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_PARAM_LENGTH);
}
