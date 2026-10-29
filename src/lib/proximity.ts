const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export interface Proximity {
  volume: number
  cutoff: number
}

const curve = (prox: number): Proximity => ({
  volume: 0.06 + 0.94 * prox * prox,
  cutoff: 220 + 3000 * Math.pow(prox, 1.5),
})

/**
 * Loudness and filter cutoff for the ring section, from its bounding rect
 * (top, bottom) and the viewport height. Faint and muffled when far below,
 * full while on screen, fading to silence as it scrolls past.
 */
export function proximity(top: number, bottom: number, vh: number): Proximity {
  if (top > vh) {
    return curve(clamp01(1 - (top - vh) / (vh * 2.2)))
  }
  if (bottom > 0.6 * vh) {
    return { volume: 1, cutoff: 3400 }
  }
  const prox = clamp01((bottom - 0.1 * vh) / (0.5 * vh))
  return { volume: prox * prox, cutoff: curve(prox).cutoff }
}

/** True while the ring section is on screen (not far below, not scrolled past). */
export const ringOnScreen = (top: number, bottom: number, vh: number) => top <= vh && bottom > 0.6 * vh
