export default function Masthead({ live = false }: { live?: boolean }) {
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <header className="mast">
      <div className="mast-strip">
        <span>{live ? 'VOL. 1 · LIVE EDITION' : 'VOL. 1 · SAMPLE EDITION'}</span>
        <span>{date.toUpperCase()}</span>
        <span>{live ? 'UPDATED THROUGH THE DAY' : 'COMING SOON'}</span>
      </div>
      <p className="mast-title display" role="presentation">THE CHORDARIUM TIMES</p>
    </header>
  )
}
