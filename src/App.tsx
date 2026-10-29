import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Cursor from './components/Cursor'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Articles from './pages/Articles'
import News from './pages/News'
import { initReveals, prefersReducedMotion } from './lib/motion'

const TITLES: Record<string, string> = {
  '/': 'Chordarium',
  '/learn': 'Learn · Chordarium',
  '/articles': 'Articles · Chordarium',
  '/news': 'Music News · Chordarium',
}

export default function App() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    document.title = TITLES[pathname] ?? 'Chordarium'
  }, [pathname])

  // Scroll to the hash target, or to the top on a new page.
  useEffect(() => {
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
    const id = window.setTimeout(() => {
      if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior })
      else window.scrollTo(0, 0)
    }, 50)
    return () => window.clearTimeout(id)
  }, [pathname, hash])

  useEffect(() => {
    let cleanup = () => {}
    const raf = requestAnimationFrame(() => (cleanup = initReveals()))
    return () => {
      cancelAnimationFrame(raf)
      cleanup()
    }
  }, [pathname])

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <Cursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/news" element={<News />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  )
}
