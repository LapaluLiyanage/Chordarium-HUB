import { TOPICS, queryArticles } from '../src/data/articles.js'
import { fetchArticles } from '../src/lib/wikiServer.js'

interface Req {
  query?: { tag?: string | string[]; q?: string | string[] }
}
interface Res {
  setHeader(k: string, v: string): void
  status(n: number): { json(body: unknown): void }
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

// GET /api/articles            -> every article with its Wikipedia summary, image and link
// GET /api/articles?tag=THEORY -> one tag
// GET /api/articles?q=chords   -> search titles and summaries
export default async function handler(req: Req, res: Res) {
  const all = await fetchArticles()
  const articles = queryArticles(all, { tag: one(req.query?.tag), q: one(req.query?.q) })
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400')
  res.status(200).json({ articles, topics: TOPICS, source: 'Wikipedia (CC BY-SA 4.0)' })
}
