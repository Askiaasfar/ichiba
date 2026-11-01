/**
 * ASKIA MARKET — Unified API Configuration & Client
 * Handles:
 * - Dynamic base URL resolution (VITE_API_URL for external backends, relative for Netlify proxy or full-stack dev)
 * - Automatic Bearer token attachment alongside cookies for cross-origin Netlify deployment
 * - Content-Type and credentials handling
 */

export const VITE_API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const AUTH_TOKEN_KEY = 'askia_session_token';

/**
 * Retrieve stored session token for Authorization header fallback
 */
export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Save session token
 */
export function setStoredAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Resolve full API endpoint URL
 */
export function getApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (VITE_API_URL) {
    return `${VITE_API_URL}${cleanPath}`;
  }
  return cleanPath;
}

/**
 * Unified fetch client that attaches credentials, Bearer tokens, and handles JSON parsing
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = getApiUrl(path);
  const headers = new Headers(options.headers || {});

  // Attach stored bearer token if present and not already specified
  const token = getStoredAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Ensure JSON Content-Type if sending a body and not FormData
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Always include cookies for session persistence
  });
}
