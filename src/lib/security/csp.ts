/** Single source of truth for the app's Content-Security-Policy. */
export const CSP_DIRECTIVES: Record<string, string[]> = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "form-action": ["'self'", "https://*.supabase.co"],
  "script-src": ["'self'", "'unsafe-inline'", "https://www.youtube.com", "https://s.ytimg.com"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "media-src": ["'self'", "blob:", "https:"],
  "connect-src": [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://*.lovable.app",
    "https://*.lovable.dev",
    "https://*.lovable.cloud",
  ],
  "frame-src": ["https://www.youtube.com", "https://www.youtube-nocookie.com"],
  "worker-src": ["'self'", "blob:"],
  "upgrade-insecure-requests": [],
};

/** frame-ancestors is ignored inside <meta>, so it is only sent as a header. */
export function buildCsp(opts: { forMeta?: boolean } = {}): string {
  const d = { ...CSP_DIRECTIVES };
  if (!opts.forMeta) d["frame-ancestors"] = ["'none'"];
  return Object.entries(d)
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ");
}

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
};
