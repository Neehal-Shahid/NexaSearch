// Vercel Serverless Function — proxies "what's trending right now" to
// SerpAPI's Google Trends API (engine=google_trends_trending_now).
// Decorative/supplementary data only: errors here must never break search —
// the client always has a small static fallback list to show instead.

import { isAdultQuery } from '../src/utils/moderation.js';
import { isRateLimited, getClientIp } from './_lib/rateLimit.js';

const SERPAPI_BASE = 'https://serpapi.com/search.json';
const MAX_TRENDS = 12;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (isRateLimited(`trending:${getClientIp(req)}`, 30)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

  const apiKeys = [process.env.SERPAPI_KEY, process.env.SERPAPI_KEY_2].filter(Boolean);
  if (apiKeys.length === 0) {
    console.error('SERPAPI_KEY environment variables are not set');
    return res.status(500).json({ error: 'Search service is not configured' });
  }

  // Trending topics are far more region-dependent than an ordinary web
  // search, so this is worth reading even though api/search.js's location
  // param (city-level) isn't relevant here — geo wants a country code.
  const country = req.headers['x-vercel-ip-country'];
  const geo = country ? country.toUpperCase() : 'US';

  for (const apiKey of apiKeys) {
    const params = new URLSearchParams({
      engine: 'google_trends_trending_now',
      geo,
      api_key: apiKey,
    });

    try {
      const response = await fetch(`${SERPAPI_BASE}?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        const raw = Array.isArray(data.trending_searches) ? data.trending_searches : [];

        // Reuse the same moderation check the rest of the app already
        // enforces — Google Trends' "trending now" feed is mainstream by
        // nature, but there's no reason to skip the same filter applied
        // everywhere else a query could end up in the UI.
        const trends = raw
          .filter((t) => t?.query && !isAdultQuery(t.query))
          .slice(0, MAX_TRENDS)
          .map((t) => ({
            query: t.query,
            searchVolume: typeof t.search_volume === 'number' ? t.search_volume : null,
          }));

        // Trending topics don't need to be second-fresh — cache generously
        // to avoid burning SerpAPI quota on a decorative feature.
        res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
        return res.status(200).json({ trends });
      }

      const errorText = await response.text();
      console.error(`SerpAPI trends error ${response.status}:`, errorText);

      if (response.status === 429 || response.status === 402) {
        continue;
      }

      return res.status(response.status).json({ error: 'Trending fetch failed' });
    } catch (error) {
      console.error('SerpAPI trends fetch error:', error);
      break;
    }
  }

  return res.status(502).json({ error: 'Unable to fetch trending searches' });
}
