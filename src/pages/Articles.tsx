import PageShell from '../components/PageShell'
import { ARTICLES, TOPICS } from '../data/articles'

export default function Articles() {
  return (
    <PageShell page="articles" label="ARTICLES" title="ARTICLES" desc="Short reads on how chords and songs fit together.">
      <section className="section">
        <ul className="articles">
          {ARTICLES.map((a) => (
            <li key={a.title} className="article" data-reveal>
              <span className="story-chip">{a.tag}</span>
              <h2>{a.title}</h2>
              <span className="article-time">{a.time}</span>
              <span className="door-pill">SOON</span>
            </li>
          ))}
        </ul>
        <ul className="tags topics" data-reveal>
          {TOPICS.map((t) => <li key={t}>{t}</li>)}
        </ul>
        <p className="footnote">Working titles. They may change before publishing.</p>
      </section>
    </PageShell>
  )
}
