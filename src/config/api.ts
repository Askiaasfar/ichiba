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

/**
 * Fetch and safely parse JSON, detecting HTML error pages (e.g. from Netlify 404/redirects or SSO walls)
 */
export async function apiJson<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, options);
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    const text = await res.text();
    if (text.includes('__cookie_check') || text.includes('accounts.google.com')) {
      throw new Error('Backend responded with Google Cloud authentication redirect. Ensure BACKEND_URL points to a public live backend service.');
    }
    throw new Error(`Expected JSON but server returned HTML (${res.status} ${res.statusText}). Endpoint path may be missing on backend.`);
  }

  const data = await res.json().catch((err) => {
    throw new Error(`Failed to parse JSON from ${path} (${res.status}): ${err.message}`);
  });

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `API request failed with status ${res.status}`;
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}
