import { COUNTRIES, STORIES, filterStories, loadStories, queryStories, sectionsOf, type NewsQuery, type Story } from './news'

describe('filterStories', () => {
  it('returns everything for ALL', () => {
    expect(filterStories(STORIES, 'ALL')).toHaveLength(STORIES.length)
  })
  it.each(COUNTRIES)('%s only shows its own stories', (c) => {
    const out = filterStories(STORIES, c)
    expect(out.length).toBeGreaterThan(0)
    expect(out.every((s) => s.country === c)).toBe(true)
  })
  it('returns an empty list when a section has no stories', () => {
    expect(filterStories([], 'UK')).toEqual([])
  })
})

const live = (id: string, date: string, section = 'LIVE', headline = id): Story => ({
  id, country: 'UK', section, headline, summary: 'a quiet summary', byline: 'X', art: 'stage', date,
})
const base: NewsQuery = { country: 'ALL', section: 'ALL', search: '', sort: 'newest' }

describe('queryStories', () => {
  const data = [live('a', '2026-01-01'), live('b', '2026-03-01', 'VINYL', 'Vinyl boom'), live('c', '2026-02-01')]
  it('sorts newest and oldest first', () => {
    expect(queryStories(data, base).map((s) => s.id)).toEqual(['b', 'c', 'a'])
    expect(queryStories(data, { ...base, sort: 'oldest' }).map((s) => s.id)).toEqual(['a', 'c', 'b'])
  })
  it('combines section and search', () => {
    expect(queryStories(data, { ...base, section: 'VINYL' }).map((s) => s.id)).toEqual(['b'])
    expect(queryStories(data, { ...base, search: 'BOOM' }).map((s) => s.id)).toEqual(['b'])
    expect(queryStories(data, { ...base, section: 'LIVE', search: 'boom' })).toEqual([])
  })
  it('keeps sample order when there are no dates', () => {
    expect(queryStories(STORIES, base).map((s) => s.id)).toEqual(STORIES.map((s) => s.id))
  })
  it('lists distinct sections', () => {
    expect(sectionsOf(data)).toEqual(['LIVE', 'VINYL'])
  })
})

describe('loadStories', () => {
  const resp = (ok: boolean, body: unknown) => (async () => ({ ok, status: ok ? 200 : 502, json: async () => body })) as unknown as typeof fetch
  it('uses live stories when the API answers', async () => {
    const r = await loadStories(resp(true, { stories: [live('a', '2026-01-01')] }))
    expect(r.live).toBe(true)
    expect(r.stories).toHaveLength(1)
  })
  it.each([[false, {}], [true, { stories: [] }]])('falls back to samples (ok=%s)', async (ok, body) => {
    expect(await loadStories(resp(ok, body))).toEqual({ stories: STORIES, live: false })
  })
  it('falls back to samples when fetch throws', async () => {
    const boom = (async () => { throw new Error('offline') }) as unknown as typeof fetch
    expect((await loadStories(boom)).live).toBe(false)
  })
})
