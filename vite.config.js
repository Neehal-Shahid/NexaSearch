import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/search': {
          target: 'https://serpapi.com',
          changeOrigin: true,
          rewrite: (path) => {
            const url = new URL(path, 'http://localhost');
            const q = url.searchParams.get('q') || '';
            const type = url.searchParams.get('type') || 'web';
            const page = url.searchParams.get('page') || '1';

            const engineMap = {
              web: 'google',
              images: 'google_images',
              news: 'google_news',
              videos: 'google_videos',
            };

            const engine = engineMap[type] || 'google';
            const start = (Math.max(1, parseInt(page, 10)) - 1) * 10;

            const params = new URLSearchParams({
              engine,
              q,
              api_key: env.SERPAPI_KEY,
              num: '10',
            });

            if (type !== 'news') {
              params.set('start', start.toString());
            }

            return `/search.json?${params.toString()}`;
          },
        },
      },
    },
  };
});
