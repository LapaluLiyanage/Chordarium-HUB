import { useEffect, useState } from 'react'
import PageShell from '../components/PageShell'
import { ARTICLES, TOPICS, type Article } from '../data/articles'

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>(ARTICLES)
  const [topics, setTopics] = useState<string[]>(TOPICS)
  const [tag, setTag] = useState<string>('ALL')

  // Load summaries from /api/articles; the plain topic list stays on screen if the request fails.
  useEffect(() => {
    const ctl = new AbortController()
    fetch('/api/articles', { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { articles?: Article[]; topics?: string[] }) => {
        if (d.articles?.length) setArticles(d.articles)
        if (d.topics?.length) setTopics(d.topics)
      })
      .catch(() => {})
    return () => ctl.abort()
  }, [])

  const shown = tag === 'ALL' ? articles : articles.filter((a) => a.tag === tag)

  return (
    <PageShell page="articles" label="ARTICLES" title="ARTICLES" stamp={false} desc="Short reads on how chords and songs fit together.">
      <section className="section">
        <div className="sectionbar" role="group" aria-label="Filter by topic">
          {['ALL', ...topics.map((t) => t.toUpperCase())].map((t) => (
            <button key={t} type="button" className="tab" aria-pressed={tag === t} onClick={() => setTag(t)}>
              {t}
            </button>
          ))}
        </div>
        <ul className="art-grid">
          {shown.map((a) => (
            <li key={a.id} className="art-card" data-reveal>
              {a.image && (
                <div className="art-pic">
                  <img src={a.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
                </div>
              )}
              <span className="story-chip">{a.tag}</span>
              <h2 className="display art-title">{a.title}</h2>
              {a.summary && <p className="art-sum">{a.summary}</p>}
              {a.url && (
                <a className="art-link" href={a.url} target="_blank" rel="noopener noreferrer">
                  READ ON WIKIPEDIA →
                </a>
              )}
            </li>
          ))}
        </ul>
        <p className="footnote">
          Summaries and images from <a href="https://en.wikipedia.org" target="_blank" rel="noopener noreferrer">Wikipedia</a>, available under{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>. Each card links to the full article and its authors.
        </p>
      </section>
    </PageShell>
  )
}
