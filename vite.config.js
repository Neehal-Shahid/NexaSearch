import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

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

            const apiKeys = [env.SERPAPI_KEY, env.SERPAPI_KEY_2].filter(Boolean);
            
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
