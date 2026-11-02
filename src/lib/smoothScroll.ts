import Lenis from 'lenis'
import gsap from 'gsap'
import { prefersReducedMotion } from './motion'

let lenis: Lenis | null = null

/** Inertia scrolling for wheel and trackpad, driven by the GSAP ticker. Returns a stop function. */
export function startSmoothScroll(): () => void {
  if (prefersReducedMotion()) return () => {}
  const instance = new Lenis({ lerp: 0.09, wheelMultiplier: 1 })
  lenis = instance
  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

export function scrollToTarget(target: HTMLElement | number, immediate = false) {
  if (lenis) lenis.scrollTo(target, { immediate, duration: immediate ? 0 : 1.3 })
  else if (typeof target === 'number') window.scrollTo(0, target)
  else target.scrollIntoView({ behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
}
