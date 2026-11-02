import type { Country } from './news'

export interface Feed {
  name: string
  url: string
}

// `when:7d` keeps Google News from returning months-old stories.
const gnews = (query: string, hl: string, gl: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:7d`)}&hl=${hl}&gl=${gl}&ceid=${gl}:en`

// Swap sources here. Each country needs at least one feed.
export const FEEDS: Record<Country, Feed[]> = {
  // Big-name artists and new releases from anywhere.
  WORLD: [
    { name: 'Billboard', url: 'https://www.billboard.com/feed/' },
    { name: 'Stereogum', url: 'https://www.stereogum.com/feed/' },
    { name: 'Consequence', url: 'https://consequence.net/feed/' },
    { name: 'Google News', url: gnews('new album OR new single OR new music video release', 'en', 'US') },
  ],
  'SRI LANKA': [
    { name: 'Google News', url: gnews('music Sri Lanka', 'en-LK', 'LK') },
    { name: 'Google News', url: gnews('Sri Lankan singer OR musician OR concert OR album', 'en-LK', 'LK') },
  ],
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
  JAPAN: [
    { name: 'Google News', url: gnews('music Japan', 'en', 'JP') },
    { name: 'Google News', url: gnews('J-pop OR Japanese artist new album OR single', 'en', 'JP') },
  ],
}
