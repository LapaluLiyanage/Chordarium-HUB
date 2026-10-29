import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { hasFinePointer, prefersReducedMotion } from '../lib/motion'

const GLYPHS = ['♪', '♫', '♩', '♬']

/** Desktop-only music-note cursor. Adds `cc-on` to <html> once running. */
export default function Cursor() {
  const note = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return
    const noteEl = note.current!
    const ringEl = ring.current!
    const labelEl = label.current!
    const html = document.documentElement
    const spawned: HTMLElement[] = []

    gsap.set([noteEl, ringEl], { xPercent: -50, yPercent: -50, opacity: 0 })
    const rx = gsap.quickTo(ringEl, 'x', { duration: 0.45, ease: 'power3.out' })
    const ry = gsap.quickTo(ringEl, 'y', { duration: 0.45, ease: 'power3.out' })

    let lastSpawn = 0
    let lastX = -999
    let lastY = -999
    let mode: 'idle' | 'link' | 'drag' = 'idle'

    const setMode = (m: typeof mode) => {
      if (m === mode) return
      mode = m
      gsap.to(ringEl, {
        scale: m === 'drag' ? 1.9 : m === 'link' ? 1.5 : 1,
        backgroundColor: m === 'link' ? 'rgba(251,245,234,1)' : 'rgba(251,245,234,0)',
        duration: 0.3,
        ease: 'back.out(2)',
      })
      gsap.to(noteEl, {
        scale: m === 'link' ? 0.6 : 1,
        rotation: m === 'link' ? -20 : 0,
        opacity: m === 'drag' ? 0 : 1,
        duration: 0.25,
      })
      labelEl.textContent = m === 'drag' ? 'DRAG' : ''
    }

    const spawn = (x: number, y: number, big = false) => {
      const s = document.createElement('span')
      s.className = 'cursor-note'
      s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      s.style.left = `${x}px`
      s.style.top = `${y}px`
      s.style.fontSize = big ? '34px' : '18px'
      document.body.appendChild(s)
      spawned.push(s)
      const dx = (Math.random() - 0.5) * (big ? 160 : 40)
      gsap.to(s, {
        y: -(40 + Math.random() * 40) * (big ? 1.6 : 1),
        x: dx,
        opacity: 0,
        rotation: (Math.random() - 0.5) * 50,
        duration: big ? 1.1 : 0.9,
        ease: 'power2.out',
        onComplete: () => {
          s.remove()
          spawned.splice(spawned.indexOf(s), 1)
        },
      })
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      gsap.set(noteEl, { x: e.clientX, y: e.clientY })
      rx(e.clientX)
      ry(e.clientY)
      if (noteEl.style.opacity === '0' || gsap.getProperty(ringEl, 'opacity') === 0) {
        gsap.set(ringEl, { x: e.clientX, y: e.clientY })
        gsap.to(ringEl, { opacity: 1, duration: 0.2 })
        if (mode !== 'drag') gsap.to(noteEl, { opacity: 1, duration: 0.2 })
      }
      const t = performance.now()
      if (t - lastSpawn > 110 && Math.hypot(e.clientX - lastX, e.clientY - lastY) > 40) {
        lastSpawn = t
        lastX = e.clientX
        lastY = e.clientY
        spawn(e.clientX, e.clientY)
      }
      const target = (e.target as Element | null)?.closest?.('[data-cursor="drag"], a, button, [role="button"], input, label')
      if (!target) setMode('idle')
      else if ((target as HTMLElement).dataset?.cursor === 'drag') setMode('drag')
      else setMode('link')
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      for (let i = 0; i < 3; i++) spawn(e.clientX, e.clientY, true)
    }
    const onLeave = () => gsap.to([noteEl, ringEl], { opacity: 0, duration: 0.2 })

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    html.classList.add('cc-on')

    return () => {
      html.classList.remove('cc-on')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf([noteEl, ringEl, ...spawned])
      spawned.forEach((s) => s.remove())
    }
  }, [])

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={note} className="cursor-glyph">♪</div>
    </div>
  )
}
