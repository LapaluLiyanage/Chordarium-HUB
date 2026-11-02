import { useEffect, useMemo, useState } from 'react'
import PageShell from '../components/PageShell'
import Masthead from '../components/news/Masthead'
import SectionBar from '../components/news/SectionBar'
import FilterBar from '../components/news/FilterBar'
import StoryCard from '../components/news/StoryCard'
import { STORIES, loadStories, queryStories, sectionsOf, type Country, type SortOrder, type Story } from '../data/news'

export default function News() {
  const [country, setCountry] = useState<Country | 'ALL'>('ALL')
  const [section, setSection] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOrder>('newest')
  const [all, setAll] = useState<Story[]>(STORIES)
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadStories().then((r) => {
      if (cancelled) return
      setAll(r.stories)
      setLive(r.live)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const sections = useMemo(() => sectionsOf(all), [all])
  const stories = useMemo(() => queryStories(all, { country, section, search, sort }), [all, country, section, search, sort])
  const kind = live ? 'stories' : 'sample stories'
  const [lead, ...others] = stories
  const side = others.slice(0, 2)
  const rest = others.slice(2)

  return (
    <PageShell page="news" label="MUSIC NEWS" title="MUSIC NEWS" stamp={!live} desc="New releases and headlines from the music world and from five countries.">
      <section className="section paper">
        <Masthead live={live} />
        <SectionBar value={country} onChange={setCountry} />
        <FilterBar sections={sections} section={section} onSection={setSection} search={search} onSearch={setSearch} sort={sort} onSort={setSort} />
        <p className="sr-only" aria-live="polite" role="status">
          {stories.length ? `Showing ${stories.length} ${kind} for ${country === 'ALL' ? 'all countries' : country}.` : 'No stories match these filters.'}
        </p>
        {!lead ? (
          <p className="empty">{loading ? 'Loading the latest headlines…' : 'No stories match these filters. Try another country, section or search.'}</p>
        ) : (
          <>
            <div className="front">
              <StoryCard story={lead} size="lead" />
              {side.length > 0 && (
                <div className="side">
                  {side.map((s) => <StoryCard key={s.id} story={s} size="side" />)}
                </div>
              )}
            </div>
            {rest.length > 0 && (
              <div className="rest">
                {rest.map((s) => <StoryCard key={s.id} story={s} />)}
              </div>
            )}
          </>
        )}
        <p className="footnote">
          {live
            ? 'Headlines come from the publishers named on each story, and every story links to where it came from. Pictures belong to the publishers; stories without one show our own drawings.'
            : 'The live feed is unavailable right now, so these are sample stories and drawings. Check back soon.'}
        </p>
      </section>
      <section className="section">
        <h2 className="display section-title" data-reveal>HOW IT WORKS.</h2>
        <ol className="steps">
          <li data-reveal><span className="step-n display">1</span><h3 className="display">PICK A PLACE</h3><p>World news, or a country you follow.</p></li>
          <li data-reveal><span className="step-n display">2</span><h3 className="display">FRESH HEADLINES</h3><p>New releases, tours, charts and awards, refreshed through the day.</p></li>
          <li data-reveal><span className="step-n display">3</span><h3 className="display">LINKED TO THE SOURCE</h3><p>Every story links back to where it came from.</p></li>
        </ol>
      </section>
    </PageShell>
  )
}
