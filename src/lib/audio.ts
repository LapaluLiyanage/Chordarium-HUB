import { PROGRESSION, type Chord } from './theory'
import { proximity, ringOnScreen } from './proximity'

const PREF_KEY = 'chordarium-sound'
const STEP = 2.6

const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

export interface AudioSnapshot {
  /** User wants sound (default on). */
  enabled: boolean
  /** The AudioContext is running (browsers lock it until a gesture). */
  running: boolean
  supported: boolean
}

function readPref(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) !== 'off'
  } catch {
    return true
  }
}

class AudioEngine {
  private ctx: AudioContext | null = null
  private bus!: GainNode
  private filter!: BiquadFilterNode
  private master!: GainNode
  private analyser!: AnalyserNode
  private noise: AudioBuffer | null = null
  private listeners = new Set<() => void>()
  private snap: AudioSnapshot = { enabled: readPref(), running: false, supported: true }
  private cleanups: Array<() => void> = []
  private timer = 0
  private loopIndex = 0
  private volume = 0.06
  private cutoff = 220
  private onScreen = false
  private ringAuto = true
  private ringChord: Chord = PROGRESSION[0]
  private refs = 0

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  getSnapshot = () => this.snap

  private set(patch: Partial<AudioSnapshot>) {
    this.snap = { ...this.snap, ...patch }
    this.listeners.forEach((l) => l())
  }

  /** Reference-counted so React StrictMode and remounts are safe. */
  init() {
    this.refs++
    if (this.ctx) return
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) {
      this.set({ supported: false })
      return
    }
    const ctx = new Ctor()
    this.ctx = ctx
    this.bus = ctx.createGain()
    this.filter = ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.master = ctx.createGain()
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 256
    this.bus.connect(this.filter).connect(this.master).connect(this.analyser).connect(ctx.destination)
    this.filter.frequency.value = this.cutoff
    this.master.gain.value = 0

    const onState = () => {
      this.set({ running: ctx.state === 'running' })
      this.apply(true)
    }
    ctx.addEventListener('statechange', onState)
    this.cleanups.push(() => ctx.removeEventListener('statechange', onState))

    const unlock = () => {
      if (ctx.state === 'suspended') void ctx.resume()
    }
    for (const ev of ['pointerdown', 'keydown', 'touchstart'] as const) {
      window.addEventListener(ev, unlock, { passive: true })
      this.cleanups.push(() => window.removeEventListener(ev, unlock))
    }
    const upd = () => this.update()
    window.addEventListener('scroll', upd, { capture: true, passive: true })
    window.addEventListener('resize', upd)
    this.cleanups.push(() => {
      window.removeEventListener('scroll', upd, { capture: true })
      window.removeEventListener('resize', upd)
    })

    this.timer = window.setInterval(() => this.tick(), STEP * 1000)
    this.set({ running: ctx.state === 'running' })
    this.update(true)
  }

  dispose() {
    this.refs = Math.max(0, this.refs - 1)
    if (this.refs > 0) return
    window.clearInterval(this.timer)
    this.cleanups.forEach((c) => c())
    this.cleanups = []
    void this.ctx?.close()
    this.ctx = null
    this.set({ running: false })
  }

  setEnabled(on: boolean) {
    try {
      localStorage.setItem(PREF_KEY, on ? 'on' : 'off')
    } catch {
      /* storage can be blocked */
    }
    this.set({ enabled: on })
    if (on && this.ctx?.state === 'suspended') void this.ctx.resume()
    this.apply()
  }

  /** Called by the ring so its own chord changes drive the sound. */
  setRing(chord: Chord, auto: boolean) {
    this.ringChord = chord
    this.ringAuto = auto
  }
  strikeFromRing(chord: Chord) {
    if (this.onScreen) this.playChord(chord)
  }

  level(): number {
    if (!this.ctx) return 0
    const buf = new Uint8Array(this.analyser.fftSize)
    this.analyser.getByteTimeDomainData(buf)
    let sum = 0
    for (const v of buf) sum += ((v - 128) / 128) ** 2
    return Math.min(1, Math.sqrt(sum / buf.length) * 5)
  }

  private update(immediate = false) {
    const el = document.getElementById('ring')
    const vh = window.innerHeight
    if (el) {
      const r = el.getBoundingClientRect()
      const p = proximity(r.top, r.bottom, vh)
      this.volume = p.volume
      this.cutoff = p.cutoff
      this.onScreen = ringOnScreen(r.top, r.bottom, vh)
    } else {
      this.volume = 0.06
      this.cutoff = 220
      this.onScreen = false
    }
    this.apply(immediate)
  }

  private apply(immediate = false) {
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    const target = this.snap.enabled ? 0.5 * this.volume : 0
    const tc = immediate ? 0.001 : 0.12
    this.master.gain.setTargetAtTime(target, t, tc)
    this.filter.frequency.setTargetAtTime(this.cutoff, t, tc)
  }

  private tick() {
    if (!this.snap.enabled || this.ctx?.state !== 'running' || document.hidden) return
    if (!this.onScreen) {
      this.playChord(PROGRESSION[this.loopIndex++ % PROGRESSION.length])
    } else if (!this.ringAuto) {
      this.playChord(this.ringChord)
    }
  }

  playChord(chord: Chord) {
    const ctx = this.ctx
    if (!ctx || ctx.state !== 'running' || !this.snap.enabled) return
    const t0 = ctx.currentTime + 0.02
    const notes: Array<{ midi: number; vel: number }> = [
      { midi: 36 + chord.bass, vel: 0.2 },
      { midi: 48 + chord.root, vel: 0.13 },
    ]
    for (const p of chord.pcs) if (p !== chord.root) notes.push({ midi: 60 + p, vel: 0.13 })
    notes.forEach((n, i) => this.piano(n.midi, n.vel, t0 + i * 0.045))
    this.strings(chord.pcs, t0)
  }

  private piano(midi: number, vel: number, when: number) {
    const ctx = this.ctx!
    const f0 = midiHz(midi)
    const levels = [1, 0.5, 0.26, 0.14, 0.07, 0.04]
    const ring = Math.min(3.6, Math.max(1.4, 3.6 - ((midi - 36) / 40) * 2.2))
    levels.forEach((lvl, idx) => {
      const k = idx + 1
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = f0 * k * Math.sqrt(1 + 0.0004 * k * k)
      const dur = ring / (1 + idx * 0.7)
      const peak = vel * lvl * 0.5
      g.gain.setValueAtTime(0.0001, when)
      g.gain.linearRampToValueAtTime(peak, when + 0.006)
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur)
      osc.connect(g).connect(this.bus)
      osc.start(when)
      osc.stop(when + dur + 0.05)
    })
    // hammer: a short band-passed noise burst
    this.noise ??= (() => {
      const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.05), ctx.sampleRate)
      const d = b.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
      return b
    })()
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = Math.min(6000, f0 * 4)
    bp.Q.value = 1
    const g = ctx.createGain()
    g.gain.setValueAtTime(vel * 0.35, when)
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.04)
    src.connect(bp).connect(g).connect(this.bus)
    src.start(when)
    src.stop(when + 0.05)
  }

  /** Quiet detuned-saw pad; far below the piano. */
  private strings(pcs: number[], when: number) {
    const ctx = this.ctx!
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1000
    lp.connect(this.bus)
    for (const p of pcs) {
      const midi = 52 + ((((p - 52) % 12) + 12) % 12)
      for (const cents of [-7, 7]) {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.value = midiHz(midi)
        osc.detune.value = cents
        g.gain.setValueAtTime(0, when)
        g.gain.linearRampToValueAtTime(0.018, when + 1.1)
        g.gain.setValueAtTime(0.018, when + 2.4)
        g.gain.linearRampToValueAtTime(0, when + 4)
        osc.connect(g).connect(lp)
        osc.start(when)
        osc.stop(when + 4.1)
      }
    }
  }
}

export const audio = new AudioEngine()
