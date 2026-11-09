import { ARTICLES, queryArticles, slugify } from './articles'

describe('articles', () => {
  it('gives every article a unique url-safe id', () => {
    const ids = ARTICLES.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/))
  })

  it('slugifies titles', () => {
    expect(slugify('Rhythm guitar: staying out of the singer’s way')).toBe('rhythm-guitar-staying-out-of-the-singers-way')
  })

  it('filters by tag, ignoring case', () => {
    const out = queryArticles(ARTICLES, { tag: 'theory' })
    expect(out.length).toBe(2)
    expect(out.every((a) => a.tag === 'THEORY')).toBe(true)
  })

  it('searches titles', () => {
    expect(queryArticles(ARTICLES, { q: 'youtube' }).map((a) => a.tag)).toEqual(['TOOLS'])
  })

  it('returns everything with no filters and nothing for an unknown tag', () => {
    expect(queryArticles(ARTICLES)).toHaveLength(ARTICLES.length)
    expect(queryArticles(ARTICLES, { tag: 'nope' })).toEqual([])
  })
})
