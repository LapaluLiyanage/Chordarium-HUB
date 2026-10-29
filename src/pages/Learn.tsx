import PageShell from '../components/PageShell'
import { MODULES, STEPS } from '../data/modules'

const Lock = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

export default function Learn() {
  return (
    <PageShell page="learn" label="LEARN" title="LEARN" desc="Music basics for people who play, with the ring to hear every idea.">
      <section className="section">
        <ul className="modules">
          {MODULES.map((m) => (
            <li key={m.title} className="module" data-reveal>
              <span className="module-lock"><Lock /><span className="sr-only">Locked</span></span>
              <h2 className="display">{m.title}</h2>
              <p>{m.desc}</p>
              <ul className="tags">
                {m.topics.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </section>
      <section className="section">
        <h2 className="display section-title" data-reveal>READ IT, HEAR IT, PLAY IT.</h2>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.n} data-reveal>
              <span className="step-n display">{s.n}</span>
              <h3 className="display">{s.title}</h3>
              <p>{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  )
}
