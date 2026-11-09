import PageShell from '../components/PageShell'
import { useEffect, useState } from 'react'
import { ARTICLES, TOPICS, type Article } from '../data/articles'

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>(ARTICLES)
  const [topics, setTopics] = useState<string[]>(TOPICS)

  // Load from /api/articles; the built-in list stays on screen if the request fails.
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

  return (
    <PageShell page="articles" label="ARTICLES" title="ARTICLES" desc="Short reads on how chords and songs fit together.">
      <section className="section">
        <ul className="articles">
          {articles.map((a) => (
            <li key={a.id} className="article" data-reveal>
              <span className="story-chip">{a.tag}</span>
              <h2>{a.title}</h2>
              <span className="article-time">{a.time}</span>
              <span className="door-pill">SOON</span>
            </li>
          ))}
        </ul>
        <ul className="tags topics" data-reveal>
          {topics.map((t) => <li key={t}>{t}</li>)}
        </ul>
        <p className="footnote">Working titles. They may change before publishing.</p>
      </section>
    </PageShell>
  )
}
