import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  Raycaster,
  SphereGeometry,
  TorusGeometry,
  Vector2,
} from 'three'
import { prefersReducedMotion } from '../lib/motion'
import { NOTE_NAMES, noteList, ringPc, type Chord } from '../lib/theory'
import { createStage, cssVar, fontsReady, makeLabel } from '../lib/stage'

const R = 3.4
const posOf = (i: number) => {
  const ang = Math.PI / 2 - (i / 12) * Math.PI * 2
  return [Math.cos(ang) * R, Math.sin(ang) * R] as const
}

interface Props {
  chord: Chord
  onTapNote: (pc: number) => void
}

export default function ChordRing({ chord, onTapNote }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const chordRef = useRef(chord)
  const apiRef = useRef<{ show(c: Chord): void } | null>(null)
  const tapRef = useRef(onTapNote)
  const [failed, setFailed] = useState(false)
  tapRef.current = onTapNote
  chordRef.current = chord

  useEffect(() => {
    apiRef.current?.show(chord)
  }, [chord])

  useEffect(() => {
    const el = host.current
    if (!el) return
    let disposed = false
    let cleanup = () => {}

    fontsReady().then(() => {
      if (disposed) return
      const stage = createStage(el, 38, 14.4)
      if (!stage) {
        setFailed(true)
        return
      }
      const reduced = prefersReducedMotion()
      const cream = new Color(cssVar('--cream', '#fbf5ea'))
      const soft = new Color(cssVar('--ink-soft', '#4a4037'))
      const teal = new Color(cssVar('--teal-on-dark', '#3bb8c4'))
      const accent = new Color(cssVar('--amber', '#f2913d'))
      const creamCss = cssVar('--cream', '#fbf5ea')

      stage.scene.add(new AmbientLight(0xffffff, 1.6))
      const dl = new DirectionalLight(0xffffff, 2)
      dl.position.set(3, 5, 8)
      stage.scene.add(dl)

      const group = new Group()
      stage.scene.add(group)

      for (const r of [R, 4.45]) {
        group.add(
          new Mesh(new TorusGeometry(r, 0.012, 8, 160), new MeshBasicMaterial({ color: cream, transparent: true, opacity: r === R ? 0.28 : 0.14 })),
        )
      }

      // dust: a shell around the ring that turns slowly, as on the Chorder wheel
      const dust = new Float32Array(420 * 3)
      for (let i = 0; i < 420; i++) {
        const d = 4 + Math.random() * 5
        const a = Math.random() * Math.PI * 2
        const u = Math.random() * 2 - 1
        const k = Math.sqrt(1 - u * u)
        dust.set([d * k * Math.cos(a), d * k * Math.sin(a), d * u * 0.6], i * 3)
      }
      const dustGeo = new BufferGeometry()
      dustGeo.setAttribute('position', new BufferAttribute(dust, 3))
      const dustPts = new Points(dustGeo, new PointsMaterial({ color: cream, size: 0.035, transparent: true, opacity: 0.35 }))
      stage.scene.add(dustPts)

      // spheres + labels
      const sphereGeo = new SphereGeometry(0.34, 24, 16)
      const balls = Array.from({ length: 12 }, (_, i) => {
        const [x, y] = posOf(i)
        const mat = new MeshStandardMaterial({ color: soft, roughness: 0.4, metalness: 0.1 })
        const mesh = new Mesh(sphereGeo, mat)
        mesh.position.set(x, y, 0)
        mesh.userData.index = i
        const lab = makeLabel(NOTE_NAMES[ringPc(i)], { font: "800 58px 'Archivo', sans-serif", color: creamCss })
        lab.sprite.scale.set(0.8, 0.8, 1)
        lab.sprite.position.set(x * 1.2, y * 1.2, 0)
        group.add(mesh, lab.sprite)
        return { mesh, mat, s: 1, z: 0, color: soft.clone() }
      })

      // chord shape: loop + fan fill, 5 vertices
      const shape = new Float32Array(15)
      const shapeGeo = new BufferGeometry()
      shapeGeo.setAttribute('position', new BufferAttribute(shape, 3))
      const fillGeo = new BufferGeometry()
      fillGeo.setAttribute('position', new BufferAttribute(shape, 3))
      fillGeo.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4])
      const fillMat = new MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.2, side: DoubleSide, depthWrite: false })
      const loopMat = new LineBasicMaterial({ color: accent })
      const fill = new Mesh(fillGeo, fillMat)
      const loop = new LineLoop(shapeGeo, loopMat)
      fill.position.z = loop.position.z = 0.1
      group.add(fill, loop)

      // centre label (outside the rotating group so it stays upright)
      const centre = makeLabel('', { font: "900 120px 'Archivo', sans-serif", color: creamCss, w: 512, h: 512 })
      centre.sprite.scale.set(4.4, 4.4, 1)
      stage.scene.add(centre.sprite)
      const drawCentre = (c: Chord) => {
        const ctx = centre.canvas.getContext('2d')!
        ctx.clearRect(0, 0, 512, 512)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = creamCss
        ctx.font = "900 150px 'Archivo', sans-serif"
        ctx.fillText(c.name, 256, 220)
        ctx.globalAlpha = 0.75
        ctx.font = "800 44px 'Archivo', sans-serif"
        ctx.fillText(noteList(c), 256, 320)
        ctx.globalAlpha = 1
        centre.texture.needsUpdate = true
      }

      const verts = new Float32Array(15)
      const vp = { t: 0 }
      let first = true
      const api = {
        show(c: Chord) {
          const accentNow = new Color(cssVar('--amber', '#f2913d'))
          fillMat.color.copy(accentNow)
          loopMat.color.copy(accentNow)
          const tones = c.pcs
            .map((p) => (p * 7) % 12)
            .sort((a, b) => a - b)
          balls.forEach((b, i) => {
            const p = ringPc(i)
            let color = soft
            let s = 1
            let z = 0
            if (p === c.root) { color = cream; s = 1.75; z = 0.5 }
            else if (p === c.bass) { color = teal; s = 1.5; z = 0.4 }
            else if (c.pcs.includes(p)) { color = accentNow; s = 1.35; z = 0.3 }
            b.color.copy(color)
            gsap.to(b, { s, z, duration: 0.5, ease: 'power3.out' })
          })
          const to = new Float32Array(15)
          for (let k = 0; k < 5; k++) {
            const i = tones[Math.min(k, tones.length - 1)]
            const [x, y] = posOf(i)
            to.set([x, y, 0], k * 3)
          }
          drawCentre(c)
          if (first || reduced) {
            verts.set(to)
            shape.set(to)
            first = false
            shapeGeo.attributes.position.needsUpdate = fillGeo.attributes.position.needsUpdate = true
          } else {
            const from = Float32Array.from(verts)
            gsap.killTweensOf(vp)
            vp.t = 0
            gsap.to(vp, {
              t: 1,
              duration: 0.8,
              ease: 'power3.inOut',
              onUpdate: () => {
                for (let k = 0; k < 15; k++) verts[k] = from[k] + (to[k] - from[k]) * vp.t
                shape.set(verts)
                shapeGeo.attributes.position.needsUpdate = fillGeo.attributes.position.needsUpdate = true
              },
            })
          }
        },
      }
      apiRef.current = api
      api.show(chordRef.current)

      // interaction: same model as the Chorder wheel. Rotation eases toward a target,
      // so the ring never snaps when the cursor moves, leaves or stops.
      const canvas = stage.renderer.domElement
      const ray = new Raycaster()
      const ndc = new Vector2()
      const REST_TILT = -0.35
      const target = { x: REST_TILT, y: 0 }
      const pulse = new Map<number, number>()
      let spin = 0
      let velocity = 0
      let dragX: number | null = null
      let hovered = -1

      const pick = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect()
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1
        ndc.set(nx, -ny)
        ray.setFromCamera(ndc, stage.camera)
        const hit = ray.intersectObjects(balls.map((b) => b.mesh), false)[0]
        return { nx, ny, index: hit ? (hit.object.userData.index as number) : -1 }
      }
      const onMove = (e: PointerEvent) => {
        const { nx, ny, index } = pick(e)
        target.x = REST_TILT + ny * 0.35
        if (dragX !== null) {
          const d = (e.clientX - dragX) * 0.008
          spin += d
          velocity = d
          dragX = e.clientX
        } else {
          target.y = nx * 0.3
        }
        hovered = index
        canvas.style.cursor = index >= 0 ? 'pointer' : dragX === null ? 'grab' : 'grabbing'
      }
      const onDown = (e: PointerEvent) => {
        dragX = e.clientX
        velocity = 0
        canvas.setPointerCapture?.(e.pointerId)
        const { index } = pick(e)
        if (index >= 0) {
          tapRef.current(ringPc(index))
          pulse.set(index, 1)
        }
        canvas.style.cursor = index >= 0 ? 'pointer' : 'grabbing'
      }
      const onUp = () => {
        dragX = null
      }
      const onLeave = () => {
        hovered = -1
      }
      canvas.style.touchAction = 'pan-y'
      canvas.dataset.cursor = 'drag'
      canvas.style.cursor = 'grab'
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerdown', onDown)
      canvas.addEventListener('pointerleave', onLeave)
      window.addEventListener('pointerup', onUp)

      group.rotation.x = REST_TILT
      stage.run((t) => {
        if (dragX === null) {
          velocity *= 0.94
          spin += velocity + (reduced ? 0 : 0.0025)
        }
        group.rotation.x += ((reduced ? REST_TILT : target.x) - group.rotation.x) * 0.06
        group.rotation.y += ((reduced ? 0 : target.y) + Math.sin(spin) * 0.5 - group.rotation.y) * 0.06
        group.rotation.z = spin * 0.6
        dustPts.rotation.y = reduced ? 0 : t * 0.03
        balls.forEach((b, i) => {
          let want = b.s + (hovered === i ? 0.3 : 0)
          const pl = pulse.get(i)
          if (pl) {
            want += pl * 0.8
            pulse.set(i, pl * 0.9)
            if (pl < 0.02) pulse.delete(i)
          }
          b.mesh.scale.setScalar(b.mesh.scale.x + (want - b.mesh.scale.x) * 0.18)
          b.mat.color.lerp(b.color, 0.15)
          b.mesh.position.z = b.z > 0 && !reduced ? b.z + Math.sin(t * 2 + i) * 0.15 : b.z
        })
      })

      cleanup = () => {
        apiRef.current = null
        canvas.removeEventListener('pointerdown', onDown)
        canvas.removeEventListener('pointermove', onMove)
        canvas.removeEventListener('pointerleave', onLeave)
        window.removeEventListener('pointerup', onUp)
        gsap.killTweensOf(vp)
        balls.forEach((b) => gsap.killTweensOf(b))
        stage.dispose()
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return (
    <div
      ref={host}
      className="ring-canvas"
      role="img"
      aria-label={`Circle of fifths. Showing ${chord.name}: ${noteList(chord)}. Drag to spin, tap a note to make it a chord.`}
    >
      {failed && <RingFlat chord={chord} size={320} />}
    </div>
  )
}

/** Flat SVG ring: also the WebGL fallback and the Flat / Mini variants. */
export function RingFlat({ chord, size = 160 }: { chord: Chord; size?: number }) {
  const r = 38
  return (
    <svg className="ring-flat" width={size} height={size} viewBox="-50 -50 100 100" role="img" aria-label={`Flat ring showing ${chord.name}`}>
      <circle r={r} fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth=".8" />
      <polygon
        points={chord.pcs
          .map((p) => (p * 7) % 12)
          .sort((a, b) => a - b)
          .map((i) => {
            const ang = Math.PI / 2 - (i / 12) * Math.PI * 2
            return `${(Math.cos(ang) * r).toFixed(1)},${(-Math.sin(ang) * r).toFixed(1)}`
          })
          .join(' ')}
        fill="var(--amber)"
        fillOpacity=".25"
        stroke="var(--amber)"
        strokeWidth="1.2"
      />
      {Array.from({ length: 12 }, (_, i) => {
        const p = ringPc(i)
        const ang = Math.PI / 2 - (i / 12) * Math.PI * 2
        const x = Math.cos(ang) * r
        const y = -Math.sin(ang) * r
        const root = p === chord.root
        const tone = chord.pcs.includes(p)
        const bass = p === chord.bass && !root
        const fill = root ? 'var(--cream)' : bass ? 'var(--teal-on-dark)' : tone ? 'var(--amber)' : 'var(--ink-soft)'
        return <circle key={i} cx={x} cy={y} r={root ? 6 : tone ? 5 : 3.4} fill={fill} />
      })}
      <text textAnchor="middle" y="5" fontSize="16" fontWeight="900" fill="currentColor" style={{ fontFamily: 'Archivo, sans-serif' }}>
        {chord.name}
      </text>
    </svg>
  )
}
