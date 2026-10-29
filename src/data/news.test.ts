import { COUNTRIES, STORIES, filterStories } from './news'

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
