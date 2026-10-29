import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://127.0.0.1:18473' },
  webServer: {
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 18473 --strictPort',
    url: 'http://127.0.0.1:18473',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
