import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../lib/motion'

const WORD = 'CHORDARIUM'

export default function WordMark() {
  const h1 = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = h1.current!
    const letters = Array.from(el.querySelectorAll<HTMLElement>('.wm-letter'))
    if (prefersReducedMotion()) return
    el.style.overflow = 'hidden'
    const tl = gsap.fromTo(
      letters,
      { yPercent: 115 },
      { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.055, onComplete: () => (el.style.overflow = 'visible') },
    )
    return () => {
      tl.kill()
      gsap.killTweensOf(letters)
    }
  }, [])

  const hover = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (prefersReducedMotion()) return
    const t = e.currentTarget
    gsap.killTweensOf(t)
    gsap
      .timeline()
      .to(t, { y: -22, color: 'var(--cream)', duration: 0.22, ease: 'power2.out' })
      .to(t, { y: 0, color: 'var(--ink)', duration: 0.8, ease: 'elastic.out(1,.35)' })
  }

  return (
    <h1 ref={h1} className="wordmark display" aria-label="Chordarium">
      {WORD.split('').map((l, i) => (
        <span key={i} className="wm-letter" aria-hidden="true" onPointerEnter={hover}>
          {l}
        </span>
      ))}
    </h1>
  )
}
