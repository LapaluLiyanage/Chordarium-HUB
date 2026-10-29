import { useEffect, useRef, useSyncExternalStore } from 'react'
import { audio } from '../lib/audio'

export default function SoundToggle() {
  const snap = useSyncExternalStore(audio.subscribe, audio.getSnapshot)
  const bar = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    const loop = () => {
      if (bar.current) bar.current.style.transform = `scaleX(${snap.enabled && snap.running ? audio.level() : 0})`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [snap.enabled, snap.running])

  if (!snap.supported) return null
  return (
    <div className="sound">
      <button type="button" className="btn btn-cream" aria-pressed={snap.enabled} onClick={() => audio.setEnabled(!snap.enabled)}>
        {snap.enabled ? 'SOUND ON' : 'SOUND OFF'}
      </button>
      <span className="meter" aria-hidden="true">
        <span ref={bar} className="meter-bar" />
      </span>
      {snap.enabled && !snap.running && (
        <span className="sound-hint" role="status">
          TAP ANYWHERE TO START
        </span>
      )}
    </div>
  )
}
