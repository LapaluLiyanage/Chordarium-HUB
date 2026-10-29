import { Link } from 'react-router-dom'

interface Props {
  n: string
  title: string
  desc: string
  to: string
}

export default function DoorRow({ n, title, desc, to }: Props) {
  return (
    <Link to={to} className="door" data-reveal>
      <span className="door-n">{n}</span>
      <span className="door-title display">{title}</span>
      <span className="door-desc">{desc}</span>
      <span className="door-pill">COMING SOON</span>
      <span className="door-arrow" aria-hidden="true">→</span>
    </Link>
  )
}
