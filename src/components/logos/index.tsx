const TILE = 'M24 4H76A20 20 0 0 1 96 24V76A20 20 0 0 1 76 96H24A20 20 0 0 1 4 76V24A20 20 0 0 1 24 4Z'
const C_ARC = 'M71.8 30.2A28 28 0 1 0 71.8 69.8'

interface P {
  size?: number
  className?: string
}

const Svg = ({ size = 100, className, children }: P & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
    {children}
  </svg>
)

export const ChorderLogo = (p: P) => (
  <Svg {...p}>
    <path d={TILE} fill="var(--amber)" />
    <path d={C_ARC} fill="none" stroke="var(--ink)" strokeWidth="12" strokeLinecap="round" />
    <circle cx="67" cy="39" r="5.5" fill="var(--cream)" />
    <circle cx="67" cy="50" r="5.5" fill="var(--ink)" />
    <circle cx="67" cy="61" r="5.5" fill="var(--ink)" />
  </Svg>
)

export const StudioLogo = (p: P) => (
  <Svg {...p}>
    <path d={TILE} fill="var(--ink)" />
    <rect x="14" y="26" width="30" height="12" rx="6" fill="var(--amber)" />
    <rect x="50" y="26" width="34" height="12" rx="6" fill="var(--cream)" />
    <rect x="26" y="44" width="26" height="12" rx="6" fill="var(--cream)" />
    <rect x="58" y="44" width="26" height="12" rx="6" fill="var(--amber)" />
    <rect x="14" y="62" width="20" height="12" rx="6" fill="var(--amber)" />
    <rect x="40" y="62" width="44" height="12" rx="6" fill="var(--cream)" />
  </Svg>
)

export const SongbookLogo = (p: P) => (
  <Svg {...p}>
    <path d={TILE} fill="var(--cream)" stroke="var(--ink)" strokeWidth="4" />
    <path d="M18 30Q34 24 50 32V74Q34 66 18 72Z" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
    <path d="M82 30Q66 24 50 32V74Q66 66 82 72Z" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
    <path d="M24 42H42M24 50H42M24 58H38" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="62" cy="62" rx="5.5" ry="4" fill="var(--amber)" transform="rotate(-20 62 62)" />
    <path d="M67 61V40q8 2 8 10" fill="none" stroke="var(--amber)" strokeWidth="3" strokeLinecap="round" />
  </Svg>
)

/** The C mark on its own, used on the logo disc. */
export const CMark = ({ size = 70 }: P) => (
  <svg width={size} height={size} viewBox="12 12 76 76" aria-hidden="true" focusable="false">
    <path d={C_ARC} fill="none" stroke="var(--amber)" strokeWidth="12" strokeLinecap="round" />
    <circle cx="67" cy="39" r="5.5" fill="var(--cream)" />
    <circle cx="67" cy="50" r="5.5" fill="var(--amber)" />
    <circle cx="67" cy="61" r="5.5" fill="var(--amber)" />
  </svg>
)

export const LOGOS = { chorder: ChorderLogo, studio: StudioLogo, songbooks: SongbookLogo }
