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
  return (
    <footer className="footer">
      <p className="footer-motto display" aria-label="Paste, play, practise, repeat">
        PASTE PLAY <span aria-hidden="true" className="dot">●</span> PRACTISE REPEAT
      </p>
      <p>© 2026 Lapalu Liyanage · Chordarium</p>
    </footer>
  )
}
