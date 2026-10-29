import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import {
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  Group,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  DoubleSide,
} from 'three'
import { prefersReducedMotion } from '../lib/motion'
import { COLS, NOTE_NAMES, PROGRESSION, ROWS, latticePos, pc, triangleFor, type Chord } from '../lib/theory'
import { createStage, cssVar, fontsReady, makeLabel } from '../lib/stage'

const CAPTION = 'C · G · Am · F — THE TONNETZ — EVERY TRIANGLE IS A CHORD'

export default function HeroLattice() {
  const host = useRef<HTMLDivElement>(null)
  const [chordName, setChordName] = useState(PROGRESSION[0].name)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = host.current
    if (!el) return
    let disposed = false
    let cleanup = () => {}

    fontsReady().then(() => {
      if (disposed) return
      const stage = createStage(el, 32, 17)
      if (!stage) {
        setFailed(true)
        return
      }
      const reduced = prefersReducedMotion()
      const cream = new Color(cssVar('--cream', '#fbf5ea'))
      const ink = new Color(cssVar('--ink', '#231d17'))
      const inkCss = cssVar('--ink', '#231d17')
      const creamCss = cssVar('--cream', '#fbf5ea')

      const group = new Group()
      stage.scene.add(group)

      // edges in three directions
      const edgePts: number[] = []
      for (let a = 0; a < COLS; a++)
        for (let b = 0; b < ROWS; b++) {
          const p = latticePos(a, b)
          for (const [da, db] of [[1, 0], [0, 1], [1, -1]] as const) {
            const na = a + da
            const nb = b + db
            if (na >= COLS || nb < 0 || nb >= ROWS) continue
            const q = latticePos(na, nb)
            edgePts.push(p.x, p.y, 0, q.x, q.y, 0)
          }
        }
      const edgeGeo = new BufferGeometry()
      edgeGeo.setAttribute('position', new BufferAttribute(new Float32Array(edgePts), 3))
      group.add(new LineSegments(edgeGeo, new LineBasicMaterial({ color: ink, transparent: true, opacity: 0.16 })))

      // nodes
      const nodeGeo = new CircleGeometry(0.34, 40)
      const nodes: Array<{ a: number; b: number; pc: number; mesh: Mesh; mat: MeshBasicMaterial; label: ReturnType<typeof makeLabel>; z: number; s: number; lit: boolean }> = []
      for (let a = 0; a < COLS; a++)
        for (let b = 0; b < ROWS; b++) {
          const p = latticePos(a, b)
          const mat = new MeshBasicMaterial({ color: cream, transparent: true, opacity: 0.3 })
          const mesh = new Mesh(nodeGeo, mat)
          mesh.position.set(p.x, p.y, 0)
          const note = NOTE_NAMES[pc(a, b)]
          const label = makeLabel(note, { font: "800 58px 'Archivo', sans-serif", color: inkCss })
          label.sprite.scale.set(0.62, 0.62, 1)
          label.sprite.position.set(p.x, p.y, 0.05)
          group.add(mesh, label.sprite)
          nodes.push({ a, b, pc: pc(a, b), mesh, mat, label, z: 0, s: 1, lit: false })
        }

      // chord triangle
      const triPos = new Float32Array(9)
      const triGeo = new BufferGeometry()
      triGeo.setAttribute('position', new BufferAttribute(triPos, 3))
      const fill = new Mesh(triGeo, new MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.16, side: DoubleSide, depthWrite: false }))
      const outline = new LineLoop(triGeo, new LineBasicMaterial({ color: ink }))
      fill.position.z = 0.3
      outline.position.z = 0.31
      group.add(fill, outline)

      // big chord name above the lattice
      const name = makeLabel('C', { font: "900 200px 'Archivo', sans-serif", color: inkCss, w: 512, h: 256 })
      name.sprite.scale.set(3.4, 1.7, 1)
      name.sprite.position.set(0, 3.15, 0)
      stage.scene.add(name.sprite)

      const tween = { v: new Float32Array(9) }
      const target = (chord: Chord) => {
        const tri = triangleFor(chord)
        const out = new Float32Array(9)
        tri.forEach((n, i) => {
          const p = latticePos(n.a, n.b)
          out.set([p.x, p.y, 0], i * 3)
        })
        return out
      }
      const setVerts = (v: Float32Array) => {
        triPos.set(v)
        triGeo.attributes.position.needsUpdate = true
      }

      let first = true
      const show = (chord: Chord) => {
        const tri = triangleFor(chord)
        const inTri = new Set(tri.map((n) => `${n.a},${n.b}`))
        const rootKey = `${tri[0].a},${tri[0].b}`
        for (const n of nodes) {
          const key = `${n.a},${n.b}`
          let color = cream
          let opacity = 0.3
          let label = inkCss
          let z = 0
          let s = 1
          if (key === rootKey) {
            color = cream; opacity = 1; z = 1.0; s = 1.55
          } else if (inTri.has(key)) {
            color = ink; opacity = 1; label = creamCss; z = 0.6; s = 1.25
          } else if (chord.pcs.includes(n.pc)) {
            opacity = 0.6
          }
          n.lit = z > 0
          n.mat.color.copy(color)
          n.label.setText(NOTE_NAMES[n.pc], label)
          gsap.to(n.mat, { opacity, duration: 0.4 })
          gsap.to(n, { z, s, duration: 0.5, ease: 'power3.out' })
        }
        name.setText(chord.name)
        setChordName(chord.name)
        const to = target(chord)
        if (first || reduced) {
          tween.v.set(to)
          setVerts(to)
          first = false
        } else {
          animateVerts(to)
        }
      }
      const vp = { t: 0 }
      function animateVerts(to: Float32Array) {
        const from = Float32Array.from(tween.v)
        gsap.killTweensOf(vp)
        vp.t = 0
        gsap.to(vp, {
          t: 1,
          duration: 0.8,
          ease: 'power3.inOut',
          onUpdate: () => {
            for (let i = 0; i < 9; i++) tween.v[i] = from[i] + (to[i] - from[i]) * vp.t
            setVerts(tween.v)
          },
        })
      }


      let idx = 0
      show(PROGRESSION[0])
      const cycle = reduced
        ? null
        : window.setInterval(() => {
            if (document.hidden) return
            idx = (idx + 1) % PROGRESSION.length
            show(PROGRESSION[idx])
          }, 2600)

      // pointer tilt
      const tilt = { x: 0, y: 0 }
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        tilt.x = ((e.clientX - r.left) / r.width - 0.5) * 2
        tilt.y = ((e.clientY - r.top) / r.height - 0.5) * 2
      }
      if (!reduced) window.addEventListener('pointermove', onMove, { passive: true })

      const beatHz = 92 / 60
      stage.run((t) => {
        if (!reduced) {
          group.rotation.y += (tilt.x * 0.5 - group.rotation.y) * 0.06
          group.rotation.x += (tilt.y * 0.4 - group.rotation.x) * 0.06
        }
        const pulse = reduced ? 0 : Math.pow(Math.max(0, Math.cos(t * beatHz * Math.PI * 2)), 6)
        for (const n of nodes) {
          const s = n.s * (n.lit ? 1 + 0.07 * pulse : 1)
          n.mesh.scale.setScalar(s)
          n.mesh.position.z = n.z
          n.label.sprite.position.z = n.z + 0.05
        }
      })

      cleanup = () => {
        if (cycle) window.clearInterval(cycle)
        window.removeEventListener('pointermove', onMove)
        gsap.killTweensOf(vp)
        nodes.forEach((n) => {
          gsap.killTweensOf(n)
          gsap.killTweensOf(n.mat)
        })
        stage.dispose()
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return (
    <figure className="lattice">
      <div
        ref={host}
        className="lattice-canvas"
        role="img"
        aria-label={`Tonnetz lattice of notes. Every triangle is a chord. Now showing ${chordName}.`}
      >
        {failed && <p className="lattice-fallback">C · G · Am · F</p>}
      </div>
      <figcaption>{CAPTION}</figcaption>
    </figure>
  )
}
