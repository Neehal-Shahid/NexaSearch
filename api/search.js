// Vercel Serverless Function — proxies search requests to SerpAPI
// The API key is read from server-side environment variables only
import { isAdultQuery } from '../src/utils/moderation.js';
import { isRateLimited, getClientIp } from './_lib/rateLimit.js';

const SERPAPI_BASE = 'https://serpapi.com/search.json';
const MAX_QUERY_LENGTH = 200;

async function fetchSerp(params) {
  const response = await fetch(`${SERPAPI_BASE}?${params.toString()}`);
  if (response.ok) {
    return { ok: true, data: await response.json() };
  }
  return { ok: false, status: response.status, errorText: await response.text() };
}

const ENGINE_MAP = {
  web: 'google',
  images: 'google_images',
  news: 'google_news',
  videos: 'google_videos',
  shopping: 'google_shopping',
  ai: 'google', // AI mode needs standard web results for context
};

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Best-effort per-IP throttle — see api/_lib/rateLimit.js for the caveats.
  if (isRateLimited(`search:${getClientIp(req)}`, 30)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

  const { q, type = 'web', page = '1' } = req.query;

  // Validate query
  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  if (q.trim().length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: 'Search query is too long' });
  }

  // Server-side enforcement of the same moderation check the client already
  // runs (src/pages/SearchPage.jsx). The client-side check alone is trivially
  // bypassed by calling this endpoint directly — this closes that gap without
  // needing a real content-moderation service.
  if (isAdultQuery(q)) {
    return res.status(403).json({ error: 'This query is not permitted.' });
  }

  const engine = ENGINE_MAP[type];
  if (!engine) {
    return res.status(400).json({ error: `Invalid search type: ${type}. Use: web, images, news, videos, shopping` });
  }

  let apiKeys = [process.env.SERPAPI_KEY, process.env.SERPAPI_KEY_2].filter(Boolean);
  
  if (req.query.keyPref === '2') {
    apiKeys = [process.env.SERPAPI_KEY_2, process.env.SERPAPI_KEY].filter(Boolean);
  }
  
  if (apiKeys.length === 0) {
    console.error('SERPAPI_KEY environment variables are not set');
    return res.status(500).json({ error: 'Search service is not configured' });
  }

  // Calculate pagination offset
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const start = (pageNum - 1) * 10;

  for (const apiKey of apiKeys) {
    const params = new URLSearchParams({
      engine,
      q: q.trim(),
      api_key: apiKey,
      safe: 'active',
    });

    // Handle engine-specific pagination parameters
    if (engine === 'google_images') {
      params.set('ijn', (pageNum - 1).toString());
    } else {
      params.set('start', start.toString());
      params.set('num', '10');
    }

    // Use Vercel's automatic geolocation headers to provide accurate local results
    const city = req.headers['x-vercel-ip-city'];
    const country = req.headers['x-vercel-ip-country'];
    
    // We only pass the city name because SerpApi fails to resolve if we append abbreviations (like 'Karachi, SD').
    if (city) {
      params.set('location', decodeURIComponent(city));
    }
    
    if (country) {
      params.set('gl', country.toLowerCase());
    }

    // Google News uses 'gl' for location but doesn't support standard 'num'
    if (type === 'news') {
      params.delete('num');
    }

    try {
      let result = await fetchSerp(params);

      // Some engines support a much narrower set of `gl` country codes than
      // others — verified live: google_shopping rejects gl=pk with a 400
      // ("Unsupported `pk` country - gl parameter.") even though the same
      // visitor's web/images/news searches work fine with it. Retry once
      // without gl/location rather than failing the whole request for
      // visitors in a country the engine doesn't support.
      if (!result.ok && result.status === 400 && params.has('gl') && /unsupported .*gl parameter/i.test(result.errorText)) {
        params.delete('gl');
        params.delete('location');
        result = await fetchSerp(params);
      }

      if (result.ok) {
        // Set cache headers — cache for 5 minutes to reduce duplicate requests
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        return res.status(200).json(result.data);
      }

      console.error(`SerpAPI error ${result.status}:`, result.errorText);

      // If quota exceeded, try the next key
      if (result.status === 429 || result.status === 402) {
        continue;
      }

      // If it's a different error, stop immediately
      return res.status(result.status).json({ error: 'Search request failed' });
    } catch (error) {
      console.error('SerpAPI fetch error:', error);
      break;
    }
  }

  // If we exhaust all keys (or break due to network error)
  return res.status(429).json({ error: 'Search quota exceeded on all keys. Please try again later.' });
}
