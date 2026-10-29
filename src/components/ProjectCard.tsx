import { useRef } from 'react'
import gsap from 'gsap'
import type { Project } from '../data/projects'
import { LOGOS } from './logos'
import { prefersReducedMotion } from '../lib/motion'

export default function ProjectCard({ p }: { p: Project }) {
  const logo = useRef<HTMLDivElement>(null)
  const Logo = LOGOS[p.id]

  const over = (on: boolean) => {
    if (prefersReducedMotion()) return
    gsap.to(logo.current, { scale: on ? 1.12 : 1, rotation: on ? -4 : 0, duration: 0.5, ease: 'back.out(2)' })
  }

  return (
    <article
      className={`card${p.dark ? ' card-dark' : ''}`}
      data-reveal
      onPointerEnter={() => over(true)}
      onPointerLeave={() => over(false)}
      onFocusCapture={() => over(true)}
      onBlurCapture={() => over(false)}
    >
      <div className="card-top">
        <div ref={logo} className="card-logo">
          <Logo size={88} />
        </div>
        <span className="card-status">{p.status}</span>
      </div>
      <p className="eyebrow">{p.eyebrow}</p>
      <h3 className="display card-title">{p.title}</h3>
      <p className="card-blurb">{p.blurb}</p>
      <ul className="tags">
        {p.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <a className={`btn ${p.dark ? 'btn-cream' : 'btn-ink'}`} href={p.href}>
        {p.cta} →
      </a>
    </article>
  )
}
