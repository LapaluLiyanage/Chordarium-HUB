export default function Masthead() {
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <header className="mast">
      <div className="mast-strip">
        <span>VOL. 1 · SAMPLE EDITION</span>
        <span>{date.toUpperCase()}</span>
        <span>COMING SOON</span>
      </div>
      <p className="mast-title display" role="presentation">THE CHORDARIUM TIMES</p>
    </header>
  )
}
