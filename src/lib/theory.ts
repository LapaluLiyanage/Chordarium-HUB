export const COLS = 7
export const ROWS = 5

export const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

/** Pitch class at Tonnetz lattice coordinate (a, b). */
export const pc = (a: number, b: number) => (((7 * a + 4 * b) % 12) + 12) % 12

/** Circle of fifths: pitch class shown at ring position i, and its inverse. */
export const ringPc = (i: number) => (i * 7) % 12
export const ringIndex = (p: number) => (p * 7) % 12

export interface Chord {
  name: string
  root: number
  /** Pitch classes, root first. */
  pcs: number[]
  bass: number
}

const mk = (name: string, root: number, intervals: number[], bass = root): Chord => ({
  name,
  root,
  pcs: intervals.map((i) => (root + i) % 12),
  bass,
})

export const CHORDS: Chord[] = [
  mk('C', 0, [0, 4, 7]),
  mk('G', 7, [0, 4, 7]),
  mk('Am', 9, [0, 3, 7]),
  mk('F', 5, [0, 4, 7]),
  mk('Dm7', 2, [0, 3, 7, 10]),
  mk('C/E', 0, [0, 4, 7], 4),
]

export const PROGRESSION = CHORDS.slice(0, 4)

export const chordFromRoot = (root: number): Chord => mk(NOTE_NAMES[root], root, [0, 4, 7])

/** Minor when the second tone is 3 semitones above the root. */
export const isMinor = (c: Chord) => c.pcs.includes((c.root + 3) % 12) && !c.pcs.includes((c.root + 4) % 12)

export const noteList = (c: Chord) => c.pcs.map((p) => NOTE_NAMES[p]).join(' · ')

export interface Pos {
  x: number
  y: number
}

export const latticePos = (a: number, b: number): Pos => ({
  x: a + 0.5 * b - (COLS - 1 + (ROWS - 1) * 0.5) / 2,
  y: 0.866 * b - ((ROWS - 1) * 0.866) / 2,
})

export interface Node {
  a: number
  b: number
}

/**
 * The triangle (root, fifth, third) that spells the chord's triad, picking the
 * occurrence closest to the lattice centre that fits inside the grid.
 */
export function triangleFor(chord: Chord): [Node, Node, Node] {
  const minor = isMinor(chord)
  let best: [Node, Node, Node] | null = null
  let bestDist = Infinity
  for (let a = 0; a <= COLS - 2; a++) {
    for (let b = minor ? 1 : 0; b <= (minor ? ROWS - 1 : ROWS - 2); b++) {
      if (pc(a, b) !== chord.root) continue
      const tri: [Node, Node, Node] = minor
        ? [{ a, b }, { a: a + 1, b }, { a: a + 1, b: b - 1 }]
        : [{ a, b }, { a: a + 1, b }, { a, b: b + 1 }]
      const ps = tri.map((n) => latticePos(n.a, n.b))
      const cx = (ps[0].x + ps[1].x + ps[2].x) / 3
      const cy = (ps[0].y + ps[1].y + ps[2].y) / 3
      const d = cx * cx + cy * cy
      if (d < bestDist) {
        bestDist = d
        best = tri
      }
    }
  }
  return best as [Node, Node, Node]
}
