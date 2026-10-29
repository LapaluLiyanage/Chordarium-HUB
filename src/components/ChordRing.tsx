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

      // dust behind
      const dust = new Float32Array(240 * 3)
      for (let i = 0; i < 240; i++) {
        dust[i * 3] = (Math.random() - 0.5) * 22
        dust[i * 3 + 1] = (Math.random() - 0.5) * 16
        dust[i * 3 + 2] = -3 - Math.random() * 4
      }
      const dustGeo = new BufferGeometry()
      dustGeo.setAttribute('position', new BufferAttribute(dust, 3))
      stage.scene.add(new Points(dustGeo, new PointsMaterial({ color: cream, size: 0.05, transparent: true, opacity: 0.35 })))

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
        return { mesh, mat, s: 1, z: 0, hover: 0, color: soft.clone() }
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
            b.mat.color.copy(color)
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
            shapeGeo.attributes.position.needsUpdate = true
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
                shapeGeo.attributes.position.needsUpdate = true
              },
            })
          }
        },
      }
      apiRef.current = api
      api.show(chordRef.current)

      // interaction
      const canvas = stage.renderer.domElement
      const ray = new Raycaster()
      const ndc = new Vector2()
      const pointer = { x: 0, y: 0 }
      let spin = 0
      let velocity = 0
      let dragging = false
      let lastX = 0
      let downX = 0
      let downT = 0
      let hovered = -1

      const pick = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect()
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
        ray.setFromCamera(ndc, stage.camera)
        const hit = ray.intersectObjects(balls.map((b) => b.mesh), false)[0]
        return hit ? (hit.object.userData.index as number) : -1
      }
      const setCursor = () => {
        canvas.style.cursor = dragging ? 'grabbing' : hovered >= 0 ? 'pointer' : 'grab'
      }
      const onDown = (e: PointerEvent) => {
        dragging = true
        lastX = downX = e.clientX
        downT = performance.now()
        velocity = 0
        canvas.setPointerCapture(e.pointerId)
        setCursor()
      }
      const onMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect()
        pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2
        pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2
        if (dragging) {
          const dx = e.clientX - lastX
          lastX = e.clientX
          velocity = dx * 0.006
          spin += velocity
        } else {
          hovered = pick(e)
        }
        setCursor()
      }
      const onUp = (e: PointerEvent) => {
        if (!dragging) return
        dragging = false
        if (Math.abs(e.clientX - downX) < 6 && performance.now() - downT < 400) {
          const i = pick(e)
          if (i >= 0) tapRef.current(ringPc(i))
        }
        setCursor()
      }
      const onLeave = () => {
        hovered = -1
        pointer.x = pointer.y = 0
        setCursor()
      }
      canvas.style.touchAction = 'pan-y'
      canvas.dataset.cursor = 'drag'
      canvas.addEventListener('pointerdown', onDown)
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerup', onUp)
      canvas.addEventListener('pointercancel', onUp)
      canvas.addEventListener('pointerleave', onLeave)
      setCursor()

      stage.run(() => {
        if (!dragging) {
          spin += velocity
          velocity *= 0.94
          if (!reduced) spin += 0.0025
        }
        group.rotation.z = spin * 0.6
        group.rotation.y = Math.sin(spin) * 0.5 + (reduced ? 0 : pointer.x * 0.12)
        group.rotation.x = reduced ? 0 : pointer.y * 0.1
        balls.forEach((b, i) => {
          const target = hovered === i ? 1 : 0
          b.hover += (target - b.hover) * 0.2
          b.mesh.scale.setScalar(b.s * (1 + 0.25 * b.hover))
          b.mesh.position.z = b.z + 0.6 * b.hover
        })
      })

      cleanup = () => {
        apiRef.current = null
        canvas.removeEventListener('pointerdown', onDown)
        canvas.removeEventListener('pointermove', onMove)
        canvas.removeEventListener('pointerup', onUp)
        canvas.removeEventListener('pointercancel', onUp)
        canvas.removeEventListener('pointerleave', onLeave)
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
