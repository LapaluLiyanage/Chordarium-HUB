import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Serves /api/news during `vite` dev with the same code the Vercel function runs.
const devNewsApi = (): Plugin => ({
  name: 'dev-news-api',
  configureServer(server) {
    server.middlewares.use('/api/news', async (_req, res) => {
      try {
        const { fetchNews } = await server.ssrLoadModule('/src/lib/newsServer.ts')
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ stories: await fetchNews() }))
      } catch {
        res.statusCode = 502
        res.end('{}')
      }
    })
  },
})

// Serves /api/articles during `vite` dev.
const devArticlesApi = (): Plugin => ({
  name: 'dev-articles-api',
  configureServer(server) {
    server.middlewares.use('/api/articles', async (req, res) => {
      try {
        const { ARTICLES, TOPICS, queryArticles } = await server.ssrLoadModule('/src/data/articles.ts')
        const params = new URL((req as { url?: string }).url ?? '', 'http://localhost').searchParams
        const articles = queryArticles(ARTICLES, { tag: params.get('tag') ?? undefined, q: params.get('q') ?? undefined })
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ articles, topics: TOPICS }))
      } catch {
        res.statusCode = 500
        res.end('{}')
      }
    })
  },
})

export default defineConfig({
  plugins: [react(), devNewsApi(), devArticlesApi()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/three') ? 'three' : undefined),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
