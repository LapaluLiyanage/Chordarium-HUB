import { CHORDS, chordFromRoot, isMinor, pc, ringIndex, ringPc, triangleFor, COLS, ROWS } from './theory'

describe('pc', () => {
  it('maps lattice coordinates to pitch classes', () => {
    expect(pc(0, 0)).toBe(0)
    expect(pc(1, 0)).toBe(7) // fifth
    expect(pc(0, 1)).toBe(4) // major third
    expect(pc(1, -1)).toBe(3) // minor third
    expect(pc(-1, 0)).toBe(5)
  })
})

describe('triangleFor', () => {
  const names = ['C', 'G', 'Am', 'F', 'Dm7', 'C/E']
  const expected: Record<string, number[]> = {
    C: [0, 4, 7],
    G: [2, 7, 11],
    Am: [0, 4, 9],
    F: [0, 5, 9],
    Dm7: [2, 5, 9],
    'C/E': [0, 4, 7],
  }
  it.each(names)('%s triangle spells the triad and fits the grid', (name) => {
    const chord = CHORDS.find((c) => c.name === name)!
    const tri = triangleFor(chord)
    expect(tri.map((n) => pc(n.a, n.b)).sort((x, y) => x - y)).toEqual(expected[name])
    for (const n of tri) {
      expect(n.a).toBeGreaterThanOrEqual(0)
      expect(n.a).toBeLessThan(COLS)
      expect(n.b).toBeGreaterThanOrEqual(0)
      expect(n.b).toBeLessThan(ROWS)
    }
    expect(pc(tri[0].a, tri[0].b)).toBe(chord.root)
  })
})

describe('chords', () => {
  it('detects minor chords', () => {
    expect(isMinor(CHORDS[2])).toBe(true)
    expect(isMinor(CHORDS[4])).toBe(true)
    expect(isMinor(CHORDS[0])).toBe(false)
  })
  it('builds a major triad from a root', () => {
    expect(chordFromRoot(2).pcs).toEqual([2, 6, 9])
  })
})

describe('circle of fifths', () => {
  it('ringPc and ringIndex are inverses', () => {
    for (let i = 0; i < 12; i++) expect(ringIndex(ringPc(i))).toBe(i)
    expect(ringPc(1)).toBe(7)
    expect(ringPc(0)).toBe(0)
  })
})
