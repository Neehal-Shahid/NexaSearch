/**
 * Search API client — fetches from our own /api/search proxy.
 * Never touches SerpAPI directly. No API key in this file.
 */

const MAX_CACHE_SIZE = 50;
const cache = new Map();

function getCacheKey(query, type, page) {
  return `${query.toLowerCase().trim()}|${type}|${page}`;
}

/**
 * Search for results.
 * @param {{ query: string, type: string, page: number, signal?: AbortSignal }} params
 * @returns {Promise<Object>} SerpAPI response data
 */
export async function search({ query, type = 'web', page = 1, signal }) {
  const cacheKey = getCacheKey(query, type, page);

  // Return cached result if available
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    q: query.trim(),
    type,
    page: page.toString(),
  });

  // Admin control: allow forcing the secondary key first
  const primaryKeyPref = typeof window !== 'undefined' ? localStorage.getItem('nexa_primary_key') : null;
  if (primaryKeyPref === '2') {
    params.set('keyPref', '2');
  }

  const response = await fetch(`/api/search?${params}`, { signal });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `Search failed (${response.status})`;

    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();

  // Store in cache (evict oldest if full)
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(cacheKey, data);

  return data;
}

// Clear the session cache (useful for testing)
export function clearSearchCache() {
  cache.clear();
}
