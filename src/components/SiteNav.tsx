import { Link, NavLink } from 'react-router-dom'

export function LogoMark({ size = 36 }: { size?: number }) {
  return <img src="/favicon.svg" alt="" width={size} height={size} />
}

export function HeroNav() {
  const links = [
    ['THE TOOLS', '#projects'],
    ['NEW PAGES', '#soon'],
    ['THE RING', '#ring'],
    ['ABOUT', '#about'],
  ]
  return (
    <nav className="nav" aria-label="Main">
      <Link to="/" className="nav-brand">
        <LogoMark />
        <span>CHORDARIUM</span>
      </Link>
      <ul className="nav-links">
        {links.map(([label, hash]) => (
          <li key={hash}>
            <Link to={{ pathname: '/', hash }}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function PillNav() {
  const items = [
    ['HOME', '/'],
    ['LEARN', '/learn'],
    ['ARTICLES', '/articles'],
    ['MUSIC NEWS', '/news'],
  ] as const
  return (
    <nav className="nav" aria-label="Main">
      <Link to="/" className="nav-brand">
        <LogoMark />
        <span>CHORDARIUM</span>
      </Link>
      <ul className="nav-pills">
        {items.map(([label, to]) => (
          <li key={to}>
            <NavLink to={to} end className="pill">
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
