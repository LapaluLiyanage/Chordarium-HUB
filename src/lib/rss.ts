import type { Country, IllustrationKey, Story } from '../data/news'

export interface RawItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decode(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
}

function clean(raw: string): string {
  const unwrapped = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  // Decode first so entity-escaped markup (&lt;p&gt;) is stripped as well.
  return decode(decode(unwrapped).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'))
  return m ? clean(m[1]) : ''
}

export function parseFeed(xml: string): RawItem[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []
  return items
    .map((block) => ({
      title: tag(block, 'title'),
      link: tag(block, 'link'),
      description: tag(block, 'description'),
      pubDate: tag(block, 'pubDate'),
      source: tag(block, 'source'),
    }))
    .filter((i) => i.title && /^https?:\/\//.test(i.link))
}

const SECTIONS: Array<[RegExp, string, IllustrationKey]> = [
  [/\b(vinyl|record store|lp|pressing)\b/i, 'VINYL', 'vinyl'],
  [/\b(cassette|tape|retro)\b/i, 'RETRO', 'cassette'],
  [/\b(guitar|bass|strings|violin|sitar)\b/i, 'GUITAR', 'guitar'],
  [/\b(drum|drummer|percussion|rhythm)\b/i, 'RHYTHM', 'drum'],
  [/\b(sheet music|school|lesson|education|students?|classroom)\b/i, 'EDUCATION', 'staff'],
  [/\b(festival|tour|concert|live|gig|stage|headline[sd]?)\b/i, 'LIVE', 'stage'],
  [/\b(album|single|ep|release[sd]?|debut|track)\b/i, 'NEW MUSIC', 'mic'],
]

export function classify(text: string): { section: string; art: IllustrationKey } {
  for (const [re, section, art] of SECTIONS) if (re.test(text)) return { section, art }
  return { section: 'MUSIC', art: 'bunting' }
}

function hash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0
  return h.toString(36)
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

export function toStory(item: RawItem, country: Country, feedName: string): Story {
  const date = new Date(item.pubDate)
  // Google News titles end with " - Publisher"; use that as the source and drop it from the headline.
  let headline = item.title
  let source = item.source || feedName
  const dash = headline.lastIndexOf(' - ')
  if (feedName === 'Google News' && dash > 0) {
    source = item.source || headline.slice(dash + 3)
    headline = headline.slice(0, dash)
  }
  // Google News descriptions only repeat the headline; skip those.
  const summary = item.description && !item.description.startsWith(headline.slice(0, 30)) ? item.description : ''
  return {
    id: hash(item.link),
    country,
    ...classify(`${headline} ${summary}`),
    headline,
    summary: clip(summary, 220),
    byline: source.toUpperCase(),
    source,
    url: item.link,
    date: Number.isNaN(date.getTime()) ? undefined : date.toISOString(),
  }
}
