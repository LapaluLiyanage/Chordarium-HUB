import { proximity, ringOnScreen } from './proximity'

const vh = 800

describe('proximity', () => {
  it('is faint and muffled when far below the viewport', () => {
    const p = proximity(vh + vh * 2.2, vh * 3, vh)
    expect(p.volume).toBeCloseTo(0.06)
    expect(p.cutoff).toBeCloseTo(220)
  })

  it('brightens as the section approaches', () => {
    const far = proximity(vh + 1500, vh + 2500, vh)
    const near = proximity(vh + 200, vh + 1200, vh)
    expect(near.volume).toBeGreaterThan(far.volume)
    expect(near.cutoff).toBeGreaterThan(far.cutoff)
  })

  it('is full volume while the ring is on screen', () => {
    expect(proximity(100, 900, vh)).toEqual({ volume: 1, cutoff: 3400 })
    expect(proximity(vh, vh + 800, vh)).toEqual({ volume: 1, cutoff: 3400 })
  })

  it('reaches silence once scrolled past', () => {
    const gone = proximity(-900, 0.1 * vh, vh)
    expect(gone.volume).toBe(0)
    expect(proximity(-900, -50, vh).volume).toBe(0)
  })

  it('fades while scrolling past', () => {
    const mid = proximity(-600, 0.35 * vh, vh)
    expect(mid.volume).toBeGreaterThan(0)
    expect(mid.volume).toBeLessThan(1)
  })

  it('reports when the ring is on screen', () => {
    expect(ringOnScreen(100, 900, vh)).toBe(true)
    expect(ringOnScreen(vh + 10, vh + 800, vh)).toBe(false)
    expect(ringOnScreen(-900, 100, vh)).toBe(false)
  })
})
