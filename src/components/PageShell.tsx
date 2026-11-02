import { Link } from 'react-router-dom'
import { PillNav } from './SiteNav'
import Stamp from './Stamp'
import Footer from './Footer'

interface Props {
  page: 'learn' | 'articles' | 'news'
  label: string
  title: string
  desc: string
  /** Pass false to hide the "coming soon" stamp. */
  stamp?: boolean
  children: React.ReactNode
}

export default function PageShell({ page, label, title, desc, stamp = true, children }: Props) {
  return (
    <>
      <header className="shell-head">
        <PillNav />
        <div className="shell-hero">
          <div>
            <p className="eyebrow">CHORDARIUM / {label}</p>
            <h1 className="display shell-title">{title}</h1>
            <p className="shell-desc">{desc}</p>
          </div>
          {stamp && <Stamp />}
        </div>
      </header>
      <main id="main">
        {children}
        <section className="cta">
          <div className="cta-card" data-reveal>
            <p className="eyebrow">IN THE MEANTIME</p>
            <h2 className="display">THE TOOLS ARE ALREADY WORKING.</h2>
            <Link to={{ pathname: '/', hash: '#projects' }} className="btn btn-cream">SEE THE TOOLS →</Link>
          </div>
        </section>
      </main>
      <Footer page={page} />
    </>
  )
}
