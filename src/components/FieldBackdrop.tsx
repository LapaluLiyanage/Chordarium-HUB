import { useEffect, useRef } from 'react'
import { BufferAttribute, BufferGeometry, Color, Points, ShaderMaterial, Vector2 } from 'three'
import { prefersReducedMotion } from '../lib/motion'
import { createStage, cssVar } from '../lib/stage'

const BEAT_RAD = (92 / 60) * Math.PI * 2

/**
 * Hero: a halftone field of ink dots. Waves roll out from the Tonnetz, pulse on the beat
 * and ripple around the cursor. Strongest on the right so the headline stays readable.
 */
const HERO_VERT = /* glsl */ `
attribute vec2 aUv;
uniform float uTime, uAspect, uPx, uMouseK;
uniform vec2 uMouse;
varying float vA;
void main() {
  vec2 q = vec2((aUv.x - 0.5) * uAspect, aUv.y - 0.5);
  vec2 src = vec2(0.34 * uAspect, 0.02);
  float beat = pow(max(0.0, cos(uTime * ${BEAT_RAD.toFixed(4)})), 6.0);
  float d0 = length(q - src);
  float wave = sin(d0 * 9.0 - uTime * 1.6) * 0.5 + 0.5;
  float d1 = length(q - uMouse);
  float ripple = sin(d1 * 26.0 - uTime * 5.0) * exp(-d1 * 4.5) * uMouseK;
  float e = wave * 0.55 + ripple * 1.5 + beat * 0.35 * exp(-d0 * 2.2);
  gl_PointSize = uPx * (2.2 + e * 4.6);
  float side = mix(0.3, 1.0, smoothstep(0.1, 0.7, aUv.x));
  vA = clamp(0.16 + e * 0.5, 0.0, 0.8) * side;
  gl_Position = vec4(aUv * 2.0 - 1.0, 0.0, 1.0);
}`

/** Ring: a rolling dotted landscape under the ring. Each chord change sends a ripple across it. */
const RING_VERT = /* glsl */ `
uniform float uTime, uPx, uPulse;
varying float vA;
void main() {
  vec3 p = position;
  float d = length(p.xz - vec2(0.0, -8.0));
  float h = sin(p.x * 0.42 + uTime * 0.8) * 0.5 + cos(p.z * 0.5 - uTime * 0.6) * 0.5;
  h += sin(d * 1.3 - uTime * 3.2) * exp(-d * 0.1) * uPulse * 1.6;
  p.y = -1.8 + h * 0.6;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = min(uPx * 6.0, uPx * (3.4 + h * 1.4) * (16.0 / -mv.z));
  vA = clamp(0.95 - (-mv.z - 8.0) * 0.02, 0.0, 0.95) * smoothstep(3.0, 11.0, -mv.z) * clamp(0.6 + 0.4 * h + 0.6 * uPulse, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
}`

const FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(uColor, vA * smoothstep(0.5, 0.3, d));
}`

export default function FieldBackdrop({ variant }: { variant: 'hero' | 'ring' }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el || prefersReducedMotion()) return
    const stage = createStage(el, variant === 'ring' ? 50 : 40, 10)
    if (!stage) return
    const px = Math.min(2, window.devicePixelRatio || 1)
    const uTime = { value: 0 }
    let cleanup = () => {}

    if (variant === 'hero') {
      const uniforms = {
        uTime,
        uAspect: { value: 1 },
        uPx: { value: px },
        uMouseK: { value: 0 },
        uMouse: { value: new Vector2(9, 9) },
        uColor: { value: new Color(cssVar('--ink', '#231d17')) },
      }
      const points = new Points(new BufferGeometry(), new ShaderMaterial({ vertexShader: HERO_VERT, fragmentShader: FRAG, uniforms, transparent: true, depthTest: false }))
      points.frustumCulled = false
      stage.scene.add(points)
      const build = () => {
        const w = el.clientWidth || 1
        const h = el.clientHeight || 1
        uniforms.uAspect.value = w / h
        const cols = Math.max(12, Math.round(w / 26))
        const rows = Math.max(8, Math.round(h / 26))
        const uv = new Float32Array(cols * rows * 2)
        for (let i = 0; i < cols; i++)
          for (let j = 0; j < rows; j++) uv.set([(i + 0.5) / cols, (j + 0.5) / rows], (i * rows + j) * 2)
        const g = new BufferGeometry()
        g.setAttribute('position', new BufferAttribute(new Float32Array(cols * rows * 3), 3))
        g.setAttribute('aUv', new BufferAttribute(uv, 2))
        points.geometry.dispose()
        points.geometry = g
      }
      build()
      let timer = 0
      const ro = new ResizeObserver(() => {
        window.clearTimeout(timer)
        timer = window.setTimeout(build, 120)
      })
      ro.observe(el)
      let lastMove = -9
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        if (e.clientY < r.top || e.clientY > r.bottom) return
        uniforms.uMouse.value.set(((e.clientX - r.left) / r.width - 0.5) * uniforms.uAspect.value, 0.5 - (e.clientY - r.top) / r.height)
        lastMove = uTime.value
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      stage.run((t) => {
        uTime.value = t
        // The ripple fades out a moment after the cursor stops.
        uniforms.uMouseK.value += ((t - lastMove > 0.4 ? 0 : 1) - uniforms.uMouseK.value) * 0.08
      })
      cleanup = () => {
        window.clearTimeout(timer)
        ro.disconnect()
        window.removeEventListener('pointermove', onMove)
      }
    } else {
      const cols = 110
      const rows = 46
      const pos = new Float32Array(cols * rows * 3)
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) pos.set([(i / (cols - 1) - 0.5) * 60, 0, 4 - (j / (rows - 1)) * 46], (i * rows + j) * 3)
      const g = new BufferGeometry()
      g.setAttribute('position', new BufferAttribute(pos, 3))
      const uniforms = {
        uTime,
        uPx: { value: px },
        uPulse: { value: 0 },
        uColor: { value: new Color(cssVar('--amber', '#f2913d')) },
      }
      const points = new Points(g, new ShaderMaterial({ vertexShader: RING_VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false }))
      points.frustumCulled = false
      stage.scene.add(points)
      stage.camera.position.set(0, 1.2, 10)
      stage.camera.lookAt(0, -0.6, -10)
      const onChord = () => (uniforms.uPulse.value = 1)
      window.addEventListener('ring:chord', onChord)
      stage.run((t) => {
        uTime.value = t
        uniforms.uPulse.value *= 0.965
      })
      cleanup = () => window.removeEventListener('ring:chord', onChord)
    }

    return () => {
      cleanup()
      stage.dispose()
    }
  }, [variant])

  return <div ref={host} className={`field-backdrop field-${variant}`} aria-hidden="true" />
}
