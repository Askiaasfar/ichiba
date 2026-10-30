/**
 * Centralized API & Authentication Configuration for ASKIA MARKET.
 * Provides resilient endpoint resolution across local dev, Cloud Run, and Netlify hosting.
 */

// Production or custom backend URL if frontend is deployed separately (e.g. on Netlify)
export const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string) ||
  (import.meta.env.VITE_BACKEND_URL as string) ||
  '';

// Google OAuth Client ID from Vite env (Netlify build) or server config
export const VITE_GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '';

/**
 * Resolves an API path to the target URL.
 * In local dev or unified container, uses relative path `/api/...`.
 * When deployed on Netlify with an external backend, prefixes with BACKEND_URL.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (BACKEND_URL) {
    const cleanBase = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    return `${cleanBase}${cleanPath}`;
  }
  return cleanPath;
}

/**
 * Robust JSON fetch wrapper with credentials: 'include'.
 * Gracefully detects non-JSON (like Netlify SPA index.html redirects for unmapped APIs).
 */
export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; status?: number }> {
  try {
    const url = getApiUrl(path);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include' // Transmit HttpOnly session cookies
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Returned HTML (e.g., Netlify SPA 404 falling back to index.html)
      return {
        success: false,
        status: res.status,
        error: `Endpoint returned non-JSON response (${res.status}). Verify backend deployment or Netlify API proxy.`
      };
    }

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error: json.message || json.error || `HTTP ${res.status}`
      };
    }

    return { success: true, data: json, status: res.status };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network request failed'
    };
  }
}
