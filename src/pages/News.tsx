import { useState } from 'react'
import PageShell from '../components/PageShell'
import Masthead from '../components/news/Masthead'
import SectionBar from '../components/news/SectionBar'
import StoryCard from '../components/news/StoryCard'
import { STORIES, filterStories, type Country } from '../data/news'

export default function News() {
  const [country, setCountry] = useState<Country | 'ALL'>('ALL')
  const stories = filterStories(STORIES, country)
  const [lead, ...others] = stories
  const side = others.slice(0, 2)
  const rest = others.slice(2)

  return (
    <PageShell page="news" label="MUSIC NEWS" title="MUSIC NEWS" desc="Headlines from the music world, country by country. Sample edition for now.">
      <section className="section paper">
        <Masthead />
        <SectionBar value={country} onChange={setCountry} />
        <p className="sr-only" aria-live="polite" role="status">
          {stories.length ? `Showing ${stories.length} sample stories for ${country === 'ALL' ? 'all countries' : country}.` : `No stories for ${country} yet.`}
        </p>
        {!lead ? (
          <p className="empty">No stories here yet. Check back soon, or try another country.</p>
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
          Every story and picture on this page is a sample drawing. The real edition will use real reporting and photos with credits.
        </p>
      </section>
      <section className="section">
        <h2 className="display section-title" data-reveal>HOW IT WILL WORK.</h2>
        <ol className="steps">
          <li data-reveal><span className="step-n display">1</span><h3 className="display">PICK A COUNTRY</h3><p>Choose the places you want to follow.</p></li>
          <li data-reveal><span className="step-n display">2</span><h3 className="display">FRESH HEADLINES</h3><p>New stories, updated through the day.</p></li>
          <li data-reveal><span className="step-n display">3</span><h3 className="display">LINKED TO THE SOURCE</h3><p>Every story links back to where it came from.</p></li>
        </ol>
      </section>
    </PageShell>
  )
}
