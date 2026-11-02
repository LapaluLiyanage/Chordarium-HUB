import { FEEDS } from '../data/feeds.js'
import { COUNTRIES, type Story } from '../data/news.js'
import { isRecent, parseFeed, toStory } from './rss.js'

const PER_FEED = 10

async function load(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 ChordariumHub', accept: 'application/rss+xml, application/xml, text/xml' }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.text()
}

/** Fetches every configured feed. A feed that fails is skipped; the rest still return. */
export async function fetchNews(): Promise<Story[]> {
  const jobs = COUNTRIES.flatMap((country) =>
    FEEDS[country].map(async (feed) => {
      const items = parseFeed(await load(feed.url))
      return items.map((i) => toStory(i, country, feed.name)).filter((s) => isRecent(s.date)).slice(0, PER_FEED)
    }),
  )
  const settled = await Promise.allSettled(jobs)
  const seen = new Set<string>()
  const stories: Story[] = []
  for (const r of settled) {
    if (r.status !== 'fulfilled') continue
    for (const s of r.value) if (!seen.has(s.id)) (seen.add(s.id), stories.push(s))
  }
  return stories.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}
