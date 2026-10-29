import type { IllustrationKey } from '../../data/news'

const ink = 'var(--ink)'
const cream = 'var(--cream)'
const accent = 'var(--amber)'
const line = { fill: 'none', stroke: ink, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const ART: Record<IllustrationKey, React.ReactNode> = {
  mic: (
    <>
      <rect x="125" y="30" width="50" height="80" rx="25" fill={accent} stroke={ink} strokeWidth="4" />
      <path d="M105 90a45 45 0 0 0 90 0M150 135v35M120 170h60" {...line} />
      <path d="M135 55h30M135 70h30M135 85h30" {...line} strokeWidth="3" />
    </>
  ),
  bunting: (
    <>
      <path d="M10 40Q150 100 290 40" {...line} />
      {[40, 90, 140, 190, 240].map((x, i) => {
        const y = 40 + Math.sin(((x - 10) / 280) * Math.PI) * 38
        return <path key={x} d={`M${x - 16} ${y} L${x + 16} ${y + 6} L${x} ${y + 48}Z`} fill={i % 2 ? cream : accent} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      })}
      <circle cx="60" cy="160" r="16" fill={accent} stroke={ink} strokeWidth="4" />
      <path d="M76 160V120l22 6" {...line} />
    </>
  ),
  stage: (
    <>
      <path d="M20 170H280M40 170V90H260V170" {...line} />
      <path d="M40 90Q70 50 100 90T160 90T220 90T260 90" fill={accent} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      <circle cx="110" cy="130" r="12" fill={cream} stroke={ink} strokeWidth="4" />
      <circle cx="190" cy="130" r="12" fill={cream} stroke={ink} strokeWidth="4" />
      <path d="M150 20V70M130 30l20 14 20-14" {...line} />
    </>
  ),
  vinyl: (
    <>
      <circle cx="140" cy="100" r="78" fill={ink} />
      <circle cx="140" cy="100" r="60" fill="none" stroke={cream} strokeWidth="1.5" opacity=".5" />
      <circle cx="140" cy="100" r="44" fill="none" stroke={cream} strokeWidth="1.5" opacity=".5" />
      <circle cx="140" cy="100" r="26" fill={accent} />
      <circle cx="140" cy="100" r="5" fill={cream} />
      <path d="M230 20L190 90" {...line} stroke={ink} />
      <circle cx="232" cy="18" r="8" fill={cream} stroke={ink} strokeWidth="4" />
    </>
  ),
  cassette: (
    <>
      <rect x="40" y="45" width="220" height="130" rx="14" fill={cream} stroke={ink} strokeWidth="4" />
      <rect x="70" y="65" width="160" height="50" rx="10" fill={accent} stroke={ink} strokeWidth="4" />
      <circle cx="108" cy="90" r="14" fill={cream} stroke={ink} strokeWidth="4" />
      <circle cx="192" cy="90" r="14" fill={cream} stroke={ink} strokeWidth="4" />
      <path d="M85 175l12-35h106l12 35" {...line} />
    </>
  ),
  drum: (
    <>
      <ellipse cx="150" cy="70" rx="80" ry="24" fill={cream} stroke={ink} strokeWidth="4" />
      <path d="M70 70V140Q150 190 230 140V70" fill={accent} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      <path d="M100 90l25 70M150 98v80M200 90l-25 70" {...line} strokeWidth="3" />
      <path d="M40 20l70 40M260 20l-70 40" {...line} />
    </>
  ),
  guitar: (
    <>
      <path d="M115 110C85 100 70 130 85 155C100 185 150 185 165 155C175 135 160 120 140 125Z" fill={accent} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      <circle cx="125" cy="148" r="12" fill={ink} />
      <path d="M140 125L235 30" {...line} strokeWidth="9" />
      <path d="M235 30l20-15 12 12-17 20" fill={cream} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
    </>
  ),
  staff: (
    <>
      {[60, 80, 100, 120, 140].map((y) => (
        <path key={y} d={`M20 ${y}H280`} {...line} strokeWidth="3" />
      ))}
      <ellipse cx="90" cy="120" rx="13" ry="10" fill={ink} transform="rotate(-20 90 120)" />
      <path d="M102 116V50" {...line} />
      <ellipse cx="170" cy="90" rx="13" ry="10" fill={accent} stroke={ink} strokeWidth="4" transform="rotate(-20 170 90)" />
      <path d="M182 86V30l22 14" {...line} />
      <ellipse cx="240" cy="130" rx="13" ry="10" fill={cream} stroke={ink} strokeWidth="4" transform="rotate(-20 240 130)" />
    </>
  ),
}

export default function Illustration({ art, label }: { art: IllustrationKey; label: string }) {
  return (
    <div className="news-pic">
      <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Sample illustration: ${label}`}>
        <rect width="300" height="200" fill="var(--sand)" />
        {ART[art]}
      </svg>
      <span className="halftone" aria-hidden="true" />
    </div>
  )
}
