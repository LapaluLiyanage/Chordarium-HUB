import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../lib/motion'

export default function Stamp({ text = 'COMING SOON' }: { text?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (prefersReducedMotion()) {
      gsap.set(el, { rotation: -6 })
      return
    }
    const tw = gsap.fromTo(el, { scale: 0, rotation: -30, opacity: 0 }, { scale: 1, rotation: -6, opacity: 1, duration: 0.7, delay: 0.3, ease: 'back.out(2.2)' })
    return () => {
      tw.kill()
    }
  }, [])
  return (
    <div ref={ref} className="stamp" style={{ transform: 'rotate(-6deg)' }}>
      {text}
    </div>
  )
}
