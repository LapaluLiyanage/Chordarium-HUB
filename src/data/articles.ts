export interface Article {
  id: string
  tag: string
  title: string
  /** Wikipedia page the summary is pulled from. */
  wiki: string
  /** Filled in by the API from Wikipedia. */
  summary?: string
  image?: string
  url?: string
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const topic = (tag: string, title: string, wiki: string): Article => ({ id: slugify(title), tag, title, wiki })

// Each entry maps to a Wikipedia page. Titles show until the live summary loads.
export const ARTICLES: Article[] = [
  topic('THEORY', 'Circle of fifths', 'Circle_of_fifths'),
  topic('THEORY', 'Chord progression', 'Chord_progression'),
  topic('THEORY', 'Intervals', 'Interval_(music)'),
  topic('THEORY', 'Scales', 'Scale_(music)'),
  topic('GUITAR', 'Rhythm guitar', 'Rhythm_guitar'),
  topic('GUITAR', 'Guitar chords', 'Guitar_chord'),
  topic('SINHALA', 'Music of Sri Lanka', 'Music_of_Sri_Lanka'),
  topic('BAND LIFE', 'Set lists', 'Set_list'),
  topic('EAR TRAINING', 'Ear training', 'Ear_training'),
]

export const TOPICS = ['Theory', 'Guitar', 'Sinhala', 'Band life', 'Ear training']

export interface ArticleQuery {
  tag?: string
  q?: string
}

/** Filters by tag (case-insensitive) and by a text search over title and summary. */
export function queryArticles(articles: Article[], { tag, q }: ArticleQuery = {}): Article[] {
  const t = tag?.trim().toUpperCase()
  const needle = q?.trim().toLowerCase()
  return articles.filter(
    (a) => (!t || a.tag === t) && (!needle || `${a.title} ${a.summary ?? ''}`.toLowerCase().includes(needle)),
  )
}
