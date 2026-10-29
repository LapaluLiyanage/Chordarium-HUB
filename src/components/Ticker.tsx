export default function Ticker() {
  const items = ['PASTE', 'PLAY', 'PRACTISE', 'REPEAT']
  const row = (key: string) => (
    <div className="ticker-row" key={key}>
      {Array.from({ length: 4 }).flatMap((_, r) =>
        items.map((w, i) => (
          <span key={`${r}-${i}`} className="ticker-item">
            {w}
            <i className="ticker-dot" />
          </span>
        )),
      )}
    </div>
  )
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {row('a')}
        {row('b')}
      </div>
    </div>
  )
}
