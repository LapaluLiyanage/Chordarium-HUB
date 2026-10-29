import gsap from 'gsap'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

/**
 * Elements marked `data-reveal` start hidden and animate in at 12% visibility.
 * A 10s failsafe shows everything; reduced motion shows everything at once.
 */
export function initReveals(): () => void {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
  if (!els.length) return () => {}
  if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
    gsap.set(els, { clearProps: 'all' })
    return () => {}
  }
  gsap.set(els, { opacity: 0, y: 32 })
  const show = (targets: Element[], stagger = 0.08) =>
    gsap.to(targets, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger, overwrite: true, clearProps: 'transform' })

  const io = new IntersectionObserver(
    (entries) => {
      const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target)
      if (!batch.length) return
      batch.forEach((t) => io.unobserve(t))
      show(batch)
    },
    { threshold: 0.12 },
  )
  els.forEach((el) => io.observe(el))
  const failsafe = window.setTimeout(() => show(els, 0), 10000)
  return () => {
    io.disconnect()
    window.clearTimeout(failsafe)
    gsap.killTweensOf(els)
  }
}
