import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { WIRE } from '../data/projects'
import { prefersReducedMotion } from '../lib/motion'

export default function Wire() {
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const tw = gsap.to(track.current, { xPercent: -50, duration: 48, ease: 'none', repeat: -1 })
    return () => {
      tw.kill()
    }
  }, [])

  const pills = [...WIRE, ...WIRE]
  return (
    <div className="wire" data-reveal>
      <div className="wire-head">
        <h3 className="display">MUSIC NEWS, FROM EVERYWHERE.</h3>
        <Link to="/news" className="btn btn-ink">OPEN MUSIC NEWS →</Link>
      </div>
      <div className="wire-marquee" aria-hidden="true">
        <div className="wire-track" ref={track}>
          {pills.map(([c, h], i) => (
            <span className="wire-pill" key={i}>
              <b>{c}</b> {h}
            </span>
          ))}
        </div>
      </div>
      <p className="wire-note">Sample headlines, not real news.</p>
    </div>
  )
}
