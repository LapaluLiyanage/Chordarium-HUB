import type { Country, IllustrationKey, Story } from '../data/news'

export interface RawItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
  image?: string
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

function attr(tagText: string, name: string): string {
  const m = tagText.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'))
  return m ? decode(m[1]) : ''
}

const isHttps = (u: string) => /^https:\/\/[^\s"'<>]+$/.test(u)

/** Best picture for an item: largest media:content/thumbnail, then an image enclosure, then the first <img>. */
export function pickImage(block: string): string | undefined {
  const media = [...block.matchAll(/<media:(?:content|thumbnail)\b[^>]*>/gi)]
    .map((m) => ({ url: attr(m[0], 'url'), w: Number(attr(m[0], 'width')) || 0, medium: attr(m[0], 'medium'), type: attr(m[0], 'type') }))
    .filter((m) => isHttps(m.url) && (!m.medium || m.medium === 'image') && (!m.type || m.type.startsWith('image')))
    .sort((a, b) => b.w - a.w)
  if (media[0]) return media[0].url
  for (const m of block.matchAll(/<enclosure\b[^>]*>/gi)) {
    if (attr(m[0], 'type').startsWith('image') && isHttps(attr(m[0], 'url'))) return attr(m[0], 'url')
  }
  const html = decode(block.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'))
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const url = attr(m[0], 'data-lazy-src') || attr(m[0], 'src')
    if (isHttps(url)) return url
  }
  return undefined
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
      image: pickImage(block),
    }))
    .filter((i) => i.title && /^https?:\/\//.test(i.link))
}

const SECTIONS: Array<[RegExp, string, IllustrationKey]> = [
  [/\b(new album|new single|new song|new music|album|single|ep|mixtape|drops?|dropped|releases?|released|unveils?|debut)\b/i, 'NEW RELEASE', 'mic'],
  [/\b(grammys?|awards?|nominat\w+|brit awards|mtv)\b/i, 'AWARDS', 'stage'],
  [/\b(charts?|no\.? ?1|number one|hot 100|streams?|streaming)\b/i, 'CHARTS', 'staff'],
  [/\b(review|reviewed)\b/i, 'REVIEWS', 'cassette'],
  [/\b(tour|tickets?|residency|festival|concert|gig|headline[sd]?|live)\b/i, 'TOURS & LIVE', 'stage'],
  [/\b(vinyl|record store|lp|pressing)\b/i, 'VINYL', 'vinyl'],
  [/\b(cassette|tape|retro)\b/i, 'RETRO', 'cassette'],
  [/\b(guitar|bass|strings|violin|sitar)\b/i, 'GUITAR', 'guitar'],
  [/\b(drum|drummer|percussion|rhythm)\b/i, 'RHYTHM', 'drum'],
  [/\b(sheet music|school|lesson|education|students?|classroom)\b/i, 'EDUCATION', 'staff'],
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
    image: item.image,
    date: Number.isNaN(date.getTime()) ? undefined : date.toISOString(),
  }
}

/** True for stories dated within the last `days`. Undated stories are not recent. */
export function isRecent(date: string | undefined, days = 7, now = Date.now()): boolean {
  const t = date ? Date.parse(date) : NaN
  return !Number.isNaN(t) && t <= now + 3_600_000 && now - t <= days * 86_400_000
}
