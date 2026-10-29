import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../lib/motion'
import { CMark } from './logos'

/** Amber ring + ink disc with the C mark; spins as the page scrolls past the hero. */
export default function LogoDisc({ heroId = 'hero' }: { heroId?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const el = ref.current!
    const rot = gsap.quickTo(el, 'rotation', { duration: 0.5, ease: 'power2.out' })
    const onScroll = () => {
      const hero = document.getElementById(heroId)
      if (!hero) return
      const scrolled = Math.max(0, -hero.getBoundingClientRect().top)
      rot(scrolled * 0.25)
    }
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true })
      gsap.killTweensOf(el)
    }
  }, [heroId])

  return (
    <div className="logo-disc" ref={ref} aria-hidden="true">
      <div className="logo-disc-inner">
        <CMark size={70} />
      </div>
    </div>
  )
}
