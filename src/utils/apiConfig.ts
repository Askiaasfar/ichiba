/**
 * Centralized API & Authentication Configuration for ASKIA MARKET.
 * Provides resilient endpoint resolution across local dev, Cloud Run, and Netlify hosting.
 */

import { apiFetch, getApiUrl as configGetApiUrl, getStoredAuthToken, setStoredAuthToken, VITE_API_URL } from '../config/api';

export { apiFetch, getStoredAuthToken, setStoredAuthToken };

// Production or custom backend URL if frontend is deployed separately (e.g. on Netlify)
export const BACKEND_URL = VITE_API_URL;

// Google OAuth Client ID from Vite env (Netlify build) or server config
export const VITE_GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '';

/**
 * Resolves an API path to the target URL.
 * In local dev or unified container, uses relative path `/api/...`.
 * When deployed on Netlify with an external backend, prefixes with BACKEND_URL.
 */
export function getApiUrl(path: string): string {
  return configGetApiUrl(path);
}

/**
 * Robust JSON fetch wrapper with credentials: 'include' and Bearer token fallback.
 * Gracefully detects non-JSON (like Netlify SPA index.html redirects for unmapped APIs).
 */
export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; status?: number }> {
  try {
    const res = await apiFetch(path, options);

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
