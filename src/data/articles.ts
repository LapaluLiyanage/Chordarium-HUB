export interface Article {
  id: string
  tag: string
  title: string
  time: string
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const draft = (tag: string, title: string, time: string): Article => ({ id: slugify(title), tag, title, time })

export const ARTICLES: Article[] = [
  draft('THEORY', 'Why four chords carry so many songs', '5 MIN READ'),
  draft('GUITAR', 'Rhythm guitar for a band: staying out of the singer’s way', '6 MIN READ'),
  draft('TOOLS', 'From a YouTube link to a chord sheet', '4 MIN READ'),
  draft('THEORY', 'The circle of fifths, read as a map', '7 MIN READ'),
  draft('SINHALA', 'Chords in Sinhala songs: what repeats', '6 MIN READ'),
]

export const TOPICS = ['Theory', 'Guitar', 'Tools', 'Sinhala songs', 'Band life', 'Ear training']

export interface ArticleQuery {
  tag?: string
  q?: string
}

/** Filters by tag (case-insensitive) and by a text search over the title. */
export function queryArticles(articles: Article[], { tag, q }: ArticleQuery = {}): Article[] {
  const t = tag?.trim().toUpperCase()
  const needle = q?.trim().toLowerCase()
  return articles.filter((a) => (!t || a.tag === t) && (!needle || a.title.toLowerCase().includes(needle)))
}
