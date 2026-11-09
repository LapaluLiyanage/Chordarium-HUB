import { ARTICLES, TOPICS, queryArticles } from '../src/data/articles.js'

interface Req {
  query?: { tag?: string | string[]; q?: string | string[] }
}
interface Res {
  setHeader(k: string, v: string): void
  status(n: number): { json(body: unknown): void }
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

// GET /api/articles            -> every article and the topic list
// GET /api/articles?tag=THEORY -> one tag
// GET /api/articles?q=chords   -> title search
export default function handler(req: Req, res: Res) {
  const articles = queryArticles(ARTICLES, { tag: one(req.query?.tag), q: one(req.query?.q) })
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.status(200).json({ articles, topics: TOPICS })
}
