import { fetchNews } from '../src/lib/newsServer.js'

export default async function handler(_req: unknown, res: {
  setHeader(k: string, v: string): void
  status(n: number): { json(body: unknown): void }
}) {
  try {
    const stories = await fetchNews()
    if (!stories.length) return res.status(502).json({ error: 'no feeds available' })
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600')
    res.status(200).json({ stories })
  } catch {
    res.status(502).json({ error: 'news fetch failed' })
  }
}
