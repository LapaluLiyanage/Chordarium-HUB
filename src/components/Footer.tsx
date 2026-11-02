import { Link } from 'react-router-dom'

export default function Footer({ page }: { page?: 'learn' | 'articles' | 'news' }) {
  if (page) {
    const others = [
      ['Learn', '/learn', 'learn'],
      ['Articles', '/articles', 'articles'],
      ['Music News', '/news', 'news'],
    ].filter((o) => o[2] !== page)
    return (
      <footer className="footer footer-page">
        <Link to="/" className="footer-back">← BACK TO CHORDARIUM</Link>
        <ul>
          {others.map(([label, to]) => (
            <li key={to}>
              <Link to={to}>{label}</Link>
            </li>
          ))}
        </ul>
        <p>© 2026 Lapalu Liyanage · Chordarium</p>
      </footer>
    )
  }
  const explore = [['The tools', '#projects'], ['New pages', '#soon'], ['The ring', '#ring'], ['About', '#about']]
  const pages = [['Learn', '/learn'], ['Articles', '/articles'], ['Music News', '/news']]
  return (
    <footer className="footer footer-home">
      <p className="footer-motto display" aria-label="Paste, play, practise, repeat">
        PASTE PLAY <span aria-hidden="true" className="dot">●</span> PRACTISE REPEAT
      </p>
      <div className="footer-cols">
        <p className="footer-blurb">Chord tools for people who play. Built for the songs my band plays, Sinhala songs included.</p>
        <nav aria-label="Explore">
          <h2 className="footer-h">EXPLORE</h2>
          <ul>
            {explore.map(([label, hash]) => (
              <li key={hash}><Link to={{ pathname: '/', hash }}>{label}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Pages">
          <h2 className="footer-h">PAGES</h2>
          <ul>
            {pages.map(([label, to]) => (
              <li key={to}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Elsewhere">
          <h2 className="footer-h">ELSEWHERE</h2>
          <ul>
            <li><a href="https://github.com/LapaluLiyanage" rel="noopener">GitHub</a></li>
            <li><a href="https://www.linkedin.com/in/lapalu-liyanage" rel="noopener">LinkedIn</a></li>
            <li><a href="https://lapalu.me" rel="noopener">Portfolio</a></li>
          </ul>
        </nav>
      </div>
      <p className="footer-legal">© 2026 Lapalu Liyanage · Chordarium</p>
    </footer>
  )
}
