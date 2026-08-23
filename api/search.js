// Vercel Serverless Function — proxies search requests to SerpAPI
// The API key is read from server-side environment variables only

const SERPAPI_BASE = 'https://serpapi.com/search.json';

const ENGINE_MAP = {
  web: 'google',
  images: 'google_images',
  news: 'google_news',
  videos: 'google_videos',
  shopping: 'google_shopping',
};

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, type = 'web', page = '1' } = req.query;

  // Validate query
  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const engine = ENGINE_MAP[type];
  if (!engine) {
    return res.status(400).json({ error: `Invalid search type: ${type}. Use: web, images, news, videos, shopping` });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error('SERPAPI_KEY environment variable is not set');
    return res.status(500).json({ error: 'Search service is not configured' });
  }

  // Calculate pagination offset
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const start = (pageNum - 1) * 10;

  // Build SerpAPI request
  const params = new URLSearchParams({
    engine,
    q: q.trim(),
    api_key: apiKey,
    start: start.toString(),
    num: '10',
  });

  // Google News uses 'gl' for location but doesn't support 'start' the same way
  if (type === 'news') {
    params.delete('start');
    params.delete('num');
  }

  try {
    const response = await fetch(`${SERPAPI_BASE}?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SerpAPI error ${response.status}:`, errorText);

      if (response.status === 429 || response.status === 402) {
        return res.status(429).json({ error: 'Search quota exceeded. Please try again later.' });
      }

      return res.status(response.status).json({ error: 'Search request failed' });
    }

    const data = await response.json();

    // Set cache headers — cache for 5 minutes to reduce duplicate requests
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (error) {
    console.error('SerpAPI fetch error:', error);
    return res.status(500).json({ error: 'Failed to connect to search service' });
  }
}
