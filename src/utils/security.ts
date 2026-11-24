/**
 * Security & URL Sanitization Utilities
 * Prevents javascript: XSS payloads, unsafe protocols, and unvalidated redirects.
 */

/**
 * Sanitizes external URLs, strictly allowing only http:// and https:// (or safe relative paths).
 * Disallows javascript:, data:, vbscript:, and file: schemes.
 */
export function sanitizeExternalUrl(url?: string | null, fallback: string = '#'): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  const lower = trimmed.toLowerCase();

  // Block dangerous schemes
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return fallback;
  }

  // Allow safe relative paths (e.g. /hero-video.mp4, /favicon.ico) but disallow protocol-relative //
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Strictly enforce http:// or https://
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}

/**
 * Sanitizes phone numbers for WhatsApp wa.me links
 */
export function sanitizeWhatsAppUrl(phone?: string | number | null, text?: string): string {
  if (!phone) return '#';
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (!cleanPhone) return '#';
  const baseUrl = `https://wa.me/${cleanPhone}`;
  if (text && typeof text === 'string') {
    return `${baseUrl}?text=${encodeURIComponent(text.trim())}`;
  }
  return baseUrl;
}
