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

export default defineConfig({
  plugins: [react(), devNewsApi()],
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
