import { ARTICLES, queryArticles, slugify } from './articles'
import { fetchArticles, trimSummary, _resetWikiCache } from '../lib/wikiServer'

describe('articles', () => {
  it('gives every article a unique url-safe id and a wiki page', () => {
    const ids = ARTICLES.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/))
    ARTICLES.forEach((a) => expect(a.wiki).toMatch(/\S/))
  })

  it('slugifies titles', () => {
    expect(slugify('Rhythm guitar: the singer’s way')).toBe('rhythm-guitar-the-singers-way')
  })

  it('filters by tag, ignoring case, and searches titles and summaries', () => {
    expect(queryArticles(ARTICLES, { tag: 'theory' }).every((a) => a.tag === 'THEORY')).toBe(true)
    expect(queryArticles(ARTICLES, { tag: 'nope' })).toEqual([])
    expect(queryArticles([{ ...ARTICLES[0], summary: 'twelve pitch classes' }], { q: 'pitch' })).toHaveLength(1)
    expect(queryArticles(ARTICLES)).toHaveLength(ARTICLES.length)
  })
})

describe('wikiServer', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    _resetWikiCache()
  })

  it('trims long summaries at a sentence', () => {
    const long = 'First sentence is here. Then ' + 'x'.repeat(400)
    expect(trimSummary(long, 60)).toBe('First sentence is here.')
    expect(trimSummary('short')).toBe('short')
  })

  it('adds summary, image and link from Wikipedia', async () => {
    vi.stubGlobal('fetch', async () => ({
      ok: true,
      json: async () => ({
        type: 'standard',
        extract: 'A summary.',
        thumbnail: { source: 'https://img/x.jpg' },
        content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/X' } },
      }),
    }))
    const out = await fetchArticles()
    expect(out).toHaveLength(ARTICLES.length)
    expect(out[0]).toMatchObject({ summary: 'A summary.', image: 'https://img/x.jpg', url: 'https://en.wikipedia.org/wiki/X' })
  })

  it('keeps the plain title when Wikipedia fails or returns a disambiguation page', async () => {
    let n = 0
    vi.stubGlobal('fetch', async () => {
      if (n++ % 2) throw new Error('down')
      return { ok: true, json: async () => ({ type: 'disambiguation', extract: 'may refer to' }) }
    })
    const out = await fetchArticles()
    expect(out.map((a) => a.title)).toEqual(ARTICLES.map((a) => a.title))
    expect(out.every((a) => !a.summary)).toBe(true)
  })
})
