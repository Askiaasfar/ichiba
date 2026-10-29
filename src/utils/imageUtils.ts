/**
 * Utility functions for resolving asset and image URLs across local development,
 * Vite production bundles, and static hosting platforms (Netlify, Vercel, GitHub Pages).
 */

export const DEFAULT_FALLBACK_IMAGE = '/assets/images/hero_marketplace_nigeria_1793094442016.jpg';

export const FALLBACK_PRODUCT_IMAGE = '/assets/images/product_tech_laptop_1793094444722.jpg';
export const FALLBACK_FASHION_IMAGE = '/assets/images/product_couture_fashion_1793094443759.jpg';
export const FALLBACK_VEHICLE_IMAGE = '/assets/images/ad_toyota_vehicle_1793094444379.jpg';

/**
 * Normalizes an image path to ensure compatibility with static hosting (Netlify/Vite dist).
 * Automatically replaces legacy `/src/assets/images/` paths with `/assets/images/`.
 */
export function normalizeImageUrl(url?: string | null, fallback = DEFAULT_FALLBACK_IMAGE): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }

  const trimmed = url.trim();

  // If path starts with /src/assets/images/, convert to /assets/images/
  if (trimmed.startsWith('/src/assets/images/')) {
    return trimmed.replace('/src/assets/images/', '/assets/images/');
  }

  // If path starts with src/assets/images/, convert to /assets/images/
  if (trimmed.startsWith('src/assets/images/')) {
    return '/' + trimmed.replace('src/assets/images/', 'assets/images/');
  }

  return trimmed;
}

/**
 * Standard image error handler to prevent broken image icons on external deployments.
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE
) {
  const target = event.currentTarget;
  if (target.src !== fallbackSrc && !target.dataset.hasFailed) {
    target.dataset.hasFailed = 'true';
    target.src = fallbackSrc;
  }
}
