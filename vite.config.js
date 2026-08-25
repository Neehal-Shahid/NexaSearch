import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { isAdultQuery } from './src/utils/moderation.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-api-search',
        configureServer(server) {
          server.middlewares.use('/api/search', async (req, res) => {
            const parsedUrl = new URL(req.url, 'http://localhost');
            const q = parsedUrl.searchParams.get('q') || '';
            const type = parsedUrl.searchParams.get('type') || 'web';
            const page = parsedUrl.searchParams.get('page') || '1';

            // Mirrors the server-side moderation check in api/search.js so
            // dev behavior matches production.
            if (isAdultQuery(q)) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'This query is not permitted.' }));
              return;
            }

            const engineMap = {
              web: 'google',
              images: 'google_images',
              news: 'google_news',
              videos: 'google_videos',
              shopping: 'google_shopping',
              ai: 'google',
            };
            const engine = engineMap[type] || 'google';
            const start = (Math.max(1, parseInt(page, 10)) - 1) * 10;

            // Mirrors api/search.js's keyPref handling — this was previously
            // missing here, so the admin dashboard's "Primary SerpAPI Key"
            // setting had no effect at all in local dev: SERPAPI_KEY was
            // always tried first regardless, and SERPAPI_KEY_2 only got used
            // once SERPAPI_KEY's quota was actually exhausted. That looks
            // exactly like "both keys' credits going up" even after setting
            // key 2 as primary, since key 1 kept absorbing real traffic.
            let apiKeys = [env.SERPAPI_KEY, env.SERPAPI_KEY_2].filter(Boolean);
            if (parsedUrl.searchParams.get('keyPref') === '2') {
              apiKeys = [env.SERPAPI_KEY_2, env.SERPAPI_KEY].filter(Boolean);
            }

            for (const apiKey of apiKeys) {
              const params = new URLSearchParams({
                engine,
                q,
                api_key: apiKey,
                num: '10',
              });
              if (type !== 'news') {
                params.set('start', start.toString());
              }

              try {
                const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
                if (response.ok) {
                  const data = await response.json();
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return;
                }
                
                // If quota exhausted (429 or 402 from SerpAPI), try the next key
                if (response.status === 429 || response.status === 402) {
                  continue;
                }
                
                // Other errors, break and return
                res.statusCode = response.status;
                res.end(JSON.stringify({ error: 'Search request failed' }));
                return;
              } catch (err) {
                console.error('Fetch error in vite proxy:', err);
                break;
              }
            }
            
            // If we exhaust all keys
            res.statusCode = 429;
            res.end(JSON.stringify({ error: 'Search quota exceeded on all keys. Please try again later.' }));
          });

          // Add /api/trending local proxy to match api/trending.js. No
          // geolocation headers exist in dev, so this always uses 'US' —
          // unlike /api/search's location param, that's a real behavior
          // difference from production, not just a missing nicety, so don't
          // be surprised if dev trending differs from what a deployed
          // visitor outside the US sees.
          server.middlewares.use('/api/trending', async (req, res) => {
            const apiKeys = [env.SERPAPI_KEY, env.SERPAPI_KEY_2].filter(Boolean);
            if (apiKeys.length === 0) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Search service is not configured' }));
              return;
            }

            for (const apiKey of apiKeys) {
              const params = new URLSearchParams({
                engine: 'google_trends_trending_now',
                geo: 'US',
                api_key: apiKey,
              });

              try {
                const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
                if (response.ok) {
                  const data = await response.json();
                  const raw = Array.isArray(data.trending_searches) ? data.trending_searches : [];
                  const trends = raw
                    .filter((t) => t?.query && !isAdultQuery(t.query))
                    .slice(0, 12)
                    .map((t) => ({
                      query: t.query,
                      searchVolume: typeof t.search_volume === 'number' ? t.search_volume : null,
                    }));
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ trends }));
                  return;
                }

                if (response.status === 429 || response.status === 402) {
                  continue;
                }

                res.statusCode = response.status;
                res.end(JSON.stringify({ error: 'Trending fetch failed' }));
                return;
              } catch (err) {
                console.error('Fetch error in vite trending proxy:', err);
                break;
              }
            }

            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Unable to fetch trending searches' }));
          });

          // Add /api/admin local proxy to match the Vercel serverless function
          server.middlewares.use('/api/admin', async (req, res) => {
            // Mirrors the ADMIN_SECRET gate in api/admin.js — see that file.
            if (!env.ADMIN_SECRET) {
              res.statusCode = 503;
              res.end(JSON.stringify({ error: 'Admin dashboard is not configured' }));
              return;
            }
            if (req.headers['x-admin-key'] !== env.ADMIN_SECRET) {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: 'Invalid admin key' }));
              return;
            }

            const apiKeys = [env.SERPAPI_KEY, env.SERPAPI_KEY_2].filter(Boolean);
            if (apiKeys.length === 0) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'No API keys configured' }));
              return;
            }

            const accounts = [];
            for (let i = 0; i < apiKeys.length; i++) {
              try {
                const response = await fetch(`https://serpapi.com/account?api_key=${apiKeys[i]}`);
                if (response.ok) {
                  const data = await response.json();
                  delete data.api_key;
                  accounts.push({
                    keyName: i === 0 ? 'Primary Key (SERPAPI_KEY)' : 'Backup Key (SERPAPI_KEY_2)',
                    ...data
                  });
                }
              } catch (e) {
                console.error('Failed to fetch account info', e);
              }
            }

            const totalLimit = accounts.reduce((sum, acc) => sum + (acc.searches_per_month || 0), 0);
            const totalUsage = accounts.reduce((sum, acc) => sum + (acc.this_month_usage || 0), 0);
            const searchesLeft = accounts.reduce((sum, acc) => sum + (acc.total_searches_left || 0), 0);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              metrics: {
                totalLimit,
                totalUsage,
                searchesLeft,
                usagePercent: totalLimit > 0 ? ((totalUsage / totalLimit) * 100).toFixed(1) : 0,
                activeKeys: accounts.length
              },
              accounts,
              recentActivity: [
                { id: 1, query: "coffee shops near me", type: "local", time: "Just now", status: "success", ms: 843 },
                { id: 2, query: "hospitals near me", type: "local", time: "5 mins ago", status: "success", ms: 912 },
                { id: 3, query: "translate to urdu", type: "web", time: "12 mins ago", status: "success", ms: 1204 },
                { id: 4, query: "best laptops 2026", type: "shopping", time: "1 hour ago", status: "success", ms: 645 },
                { id: 5, query: "how to learn react", type: "videos", time: "3 hours ago", status: "success", ms: 1102 }
              ],
              topQueries: [
                { query: "weather", count: 124, trend: "+12%" },
                { query: "news", count: 89, trend: "+5%" },
                { query: "translation", count: 56, trend: "+18%" },
                { query: "local restaurants", count: 42, trend: "-2%" }
              ]
            }));
          });
        }
      }
    ],
    server: {
      proxy: {
        '/api/chat': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => {
            const url = new URL(path, 'http://localhost');
            const model = url.searchParams.get('model') || 'gemini-3.5-flash-lite';
            return `/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
          },
        }
      },
    },
  };
});
