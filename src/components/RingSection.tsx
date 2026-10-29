import { useCallback, useEffect, useRef, useState } from 'react'
import ChordRing, { RingFlat } from './ChordRing'
import SoundToggle from './SoundToggle'
import { CMark } from './logos'
import { audio } from '../lib/audio'
import { prefersReducedMotion } from '../lib/motion'
import { CHORDS, NOTE_NAMES, chordFromRoot, noteList, type Chord } from '../lib/theory'

export default function RingSection() {
  const [chord, setChord] = useState<Chord>(CHORDS[0])
  const [auto, setAuto] = useState(() => !prefersReducedMotion())
  const [visible, setVisible] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    audio.init()
    return () => audio.dispose()
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver((e) => setVisible(e[0].isIntersecting), { threshold: 0.2 })
    io.observe(root.current!)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    audio.setRing(chord, auto)
  }, [chord, auto])

  const lastStruck = useRef<Chord | null>(null)
  useEffect(() => {
    if (lastStruck.current === chord) return
    lastStruck.current = chord
    audio.strikeFromRing(chord)
  }, [chord])

  useEffect(() => {
    if (!auto || !visible) return
    const id = window.setInterval(() => {
      setChord((c) => CHORDS[(CHORDS.indexOf(c) + 1) % CHORDS.length] ?? CHORDS[0])
    }, 2600)
    return () => window.clearInterval(id)
  }, [auto, visible])

  const pick = useCallback((c: Chord) => {
    setAuto(false)
    setChord(c)
  }, [])
  const tapNote = useCallback((pc: number) => pick(chordFromRoot(pc)), [pick])

  const bassNote = NOTE_NAMES[chord.bass]
  const hasBass = chord.bass !== chord.root

  return (
    <div className="ring-wrap" ref={root}>
      <div className="ring-grid">
        <ChordRing chord={chord} onTapNote={tapNote} />
        <div className="ring-ui">
          <p className="eyebrow">NOW SHOWING</p>
          <p className="ring-chord display" aria-live="polite">{chord.name}</p>
          <p className="ring-notes">{noteList(chord)}</p>
          <p className="ring-roles">
            Root {NOTE_NAMES[chord.root]}
            {hasBass ? ` · Bass ${bassNote}` : ''}
          </p>
          <ul className="chips">
            {CHORDS.map((c) => (
              <li key={c.name}>
                <button type="button" className="chip" aria-pressed={c === chord || c.name === chord.name} onClick={() => pick(c)}>
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="ring-controls">
            <button type="button" className="btn btn-outline-cream" aria-pressed={auto} onClick={() => setAuto((a) => !a)}>
              {auto ? '❚❚ AUTO-PLAY ON' : '▶ AUTO-PLAY OFF'}
            </button>
            <SoundToggle />
          </div>
          <ul className="legend">
            <li><i style={{ background: 'var(--cream)' }} />Root</li>
            <li><i style={{ background: 'var(--amber)' }} />Chord tone</li>
            <li><i style={{ background: 'var(--teal-on-dark)' }} />Bass note</li>
            <li><i style={{ background: 'var(--ink-soft)' }} />Other</li>
          </ul>
          <p className="ring-hint">Drag to spin the ring. Tap a note to make it a chord.</p>
        </div>
      </div>

      <div className="variants">
        <figure>
          <RingFlat chord={chord} size={160} />
          <figcaption>FLAT</figcaption>
        </figure>
        <figure>
          <RingFlat chord={chord} size={88} />
          <figcaption>MINI</figcaption>
        </figure>
        <figure>
          <div className="mark-variant" aria-hidden="true">
            <CMark size={72} />
          </div>
          <figcaption>MARK</figcaption>
        </figure>
      </div>
    </div>
  )
}
