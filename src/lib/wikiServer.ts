import { ARTICLES, type Article } from '../data/articles.js'

const SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/'
const MAX_SUMMARY = 320
const TTL_MS = 6 * 60 * 60 * 1000

interface WikiSummary {
  type?: string
  extract?: string
  thumbnail?: { source?: string }
  content_urls?: { desktop?: { page?: string } }
}

/** Trims to a whole sentence under the limit; "i.e." and "e.g." do not count as sentence ends. */
export function trimSummary(text: string, max = MAX_SUMMARY): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  let end = -1
  for (const m of t.matchAll(/[.!?](?=\s+[A-Z])/g)) {
    if (m.index !== undefined && m.index < max) end = m.index
  }
  return end > max * 0.3 ? t.slice(0, end + 1) : `${t.slice(0, max).replace(/\s+\S*$/, '')}…`
}

async function enrich(a: Article): Promise<Article> {
  try {
    const res = await fetch(SUMMARY + encodeURIComponent(a.wiki), {
      headers: { 'user-agent': 'ChordariumHub/1.0 (https://chordarium.lapalu.me)', accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return a
    const d = (await res.json()) as WikiSummary
    if (d.type !== 'standard' || !d.extract) return a
    return {
      ...a,
      summary: trimSummary(d.extract),
      image: d.thumbnail?.source,
      url: d.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${a.wiki}`,
    }
  } catch {
    return a
  }
}

let cache: { at: number; articles: Article[] } | undefined

/** Every article with its Wikipedia summary, image and link. Failed lookups keep the plain title. */
export async function fetchArticles(): Promise<Article[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.articles
  const articles = await Promise.all(ARTICLES.map(enrich))
  // Only cache a complete run, so a Wikipedia blip does not stick for hours.
  if (articles.every((a) => a.summary)) cache = { at: Date.now(), articles }
  return articles
}

export const _resetWikiCache = () => {
  cache = undefined
}
