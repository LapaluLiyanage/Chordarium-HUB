import {
  CanvasTexture,
  PerspectiveCamera,
  Scene,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three'

export interface Stage {
  renderer: WebGLRenderer
  scene: Scene
  camera: PerspectiveCamera
  /** Register the per-frame callback (seconds since start) and start the loop. */
  run(frame: (t: number) => void): void
  dispose(): void
}

export const cssVar = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

/** Resolves once the canvas label fonts are available (or after a short timeout). */
export async function fontsReady() {
  try {
    await Promise.race([
      Promise.all([document.fonts.load("800 58px 'Archivo'"), document.fonts.load("900 200px 'Archivo'")]),
      new Promise((r) => setTimeout(r, 2500)),
    ])
  } catch {
    /* fall back to system font */
  }
}

/**
 * Transparent renderer sized to `host`, paused while off screen or when the
 * tab is hidden. Returns null when WebGL is unavailable.
 */
export function createStage(host: HTMLElement, fov: number, z: number): Stage | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.style.cssText = 'display:block;width:100%;height:100%'
  host.appendChild(canvas)

  const scene = new Scene()
  const camera = new PerspectiveCamera(fov, 1, 0.1, 100)
  camera.position.z = z

  const resize = () => {
    const w = host.clientWidth || 1
    const h = host.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  resize()

  let onScreen = true
  const io = new IntersectionObserver((e) => (onScreen = e[0]?.isIntersecting ?? true))
  io.observe(host)

  let raf = 0
  let frame: ((t: number) => void) | null = null
  let last = performance.now()
  let clock = 0
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    if (!onScreen || document.hidden) return
    clock += dt
    frame?.(clock)
    renderer.render(scene, camera)
  }

  return {
    renderer,
    scene,
    camera,
    run(cb) {
      frame = cb
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    },
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      scene.traverse((o) => {
        const m = o as unknown as { geometry?: { dispose(): void }; material?: unknown }
        m.geometry?.dispose()
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
        for (const mat of mats as Array<{ map?: { dispose(): void } | null; dispose(): void }>) {
          mat.map?.dispose()
          mat.dispose()
        }
      })
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}

export interface LabelOpts {
  font: string
  color: string
  size?: number
  w?: number
  h?: number
}

/** A sprite whose canvas texture can be redrawn with `setText`. */
export function makeLabel(text: string, opts: LabelOpts) {
  const w = opts.w ?? 128
  const h = opts.h ?? 128
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  const sprite = new Sprite(new SpriteMaterial({ map: tex, transparent: true, depthTest: false }))
  const draw = (t: string, color = opts.color) => {
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = color
    ctx.font = opts.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(t, w / 2, h / 2 + 2)
    tex.needsUpdate = true
  }
  draw(text)
  return { sprite, setText: draw, canvas, texture: tex }
}
