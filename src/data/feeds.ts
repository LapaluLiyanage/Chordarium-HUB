import type { Country } from './news'

export interface Feed {
  name: string
  url: string
}

const gnews = (query: string, hl: string, gl: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${gl}:en`

// Swap sources here. Each country needs at least one feed.
export const FEEDS: Record<Country, Feed[]> = {
  'SRI LANKA': [{ name: 'Google News', url: gnews('music Sri Lanka', 'en-LK', 'LK') }],
  INDIA: [
    { name: 'Rolling Stone India', url: 'https://rollingstoneindia.com/feed/' },
    { name: 'Google News', url: gnews('music India', 'en-IN', 'IN') },
  ],
  UK: [
    { name: 'The Guardian', url: 'https://www.theguardian.com/music/rss' },
    { name: 'NME', url: 'https://www.nme.com/feed' },
  ],
  USA: [
    { name: 'Rolling Stone', url: 'https://www.rollingstone.com/music/feed/' },
    { name: 'Pitchfork', url: 'https://pitchfork.com/feed/feed-news/rss' },
  ],
  JAPAN: [{ name: 'Google News', url: gnews('music Japan', 'en', 'JP') }],
}
