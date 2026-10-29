import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../lib/motion'

/** Endless word strip; scrolling the page pushes it faster, then it eases back. */
export default function Ticker() {
  const track = useRef<HTMLDivElement>(null)
  const items = ['PASTE', 'PLAY', 'PRACTISE', 'REPEAT']

  useEffect(() => {
    if (prefersReducedMotion()) return
    const tw = gsap.to(track.current, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 })
    let lastY = window.scrollY
    let lastT = performance.now()
    const onScroll = () => {
      const t = performance.now()
      const v = Math.abs(window.scrollY - lastY) / Math.max(1, t - lastT)
      lastY = window.scrollY
      lastT = t
      gsap.to(tw, { timeScale: 1 + Math.min(v * 6, 5), duration: 0.2, overwrite: true })
      gsap.to(tw, { timeScale: 1, duration: 1.2, delay: 0.2, ease: 'power2.out' })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      gsap.killTweensOf(tw)
      tw.kill()
    }
  }, [])

  const row = (key: string) => (
    <div className="ticker-row" key={key}>
      {Array.from({ length: 4 }).flatMap((_, r) =>
        items.map((w, i) => (
          <span key={`${r}-${i}`} className="ticker-item">
            {w}
            <i className="ticker-dot" />
          </span>
        )),
      )}
    </div>
  )
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track" ref={track}>
        {row('a')}
        {row('b')}
      </div>
    </div>
  )
}
