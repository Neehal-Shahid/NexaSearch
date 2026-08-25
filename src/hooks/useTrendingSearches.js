import { useEffect, useState } from 'react';
import { TRENDING_SEARCHES } from '../constants';

const FALLBACK = TRENDING_SEARCHES.map((query) => ({ query, searchVolume: null }));
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — roughly matches api/trending.js's own cache window

// Module-level, not component state: every consumer (CommandPalette,
// HomePage's TrendingSearches) shares one cached result and one in-flight
// request instead of each firing its own fetch.
let cachedTrends = null;
let cachedAt = 0;
let inFlight = null;

async function fetchTrends() {
  const res = await fetch('/api/trending');
  if (!res.ok) throw new Error(`Trending fetch failed (${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data.trends) || data.trends.length === 0) throw new Error('No trends returned');
  return data.trends;
}

/**
 * Real, live "what's trending right now" data (via SerpAPI's Google Trends
 * API), with the static TRENDING_SEARCHES list as an always-available
 * fallback — this is decorative/supplementary, so a failed fetch should
 * never surface an error state, just quietly keep showing the fallback.
 */
export function useTrendingSearches() {
  const isCacheFresh = cachedTrends && Date.now() - cachedAt < CACHE_TTL_MS;
  const [trends, setTrends] = useState(() => (isCacheFresh ? cachedTrends : FALLBACK));

  useEffect(() => {
    if (cachedTrends && Date.now() - cachedAt < CACHE_TTL_MS) {
      setTrends(cachedTrends);
      return;
    }

    let cancelled = false;

    if (!inFlight) {
      inFlight = fetchTrends().finally(() => {
        inFlight = null;
      });
    }

    inFlight
      .then((result) => {
        cachedTrends = result;
        cachedAt = Date.now();
        if (!cancelled) setTrends(result);
      })
      .catch(() => {
        // Keep showing the static fallback that was already set as initial state.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { trends };
}
