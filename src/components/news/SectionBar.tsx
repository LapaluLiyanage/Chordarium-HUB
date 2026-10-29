import { COUNTRIES, type Country } from '../../data/news'

interface Props {
  value: Country | 'ALL'
  onChange: (v: Country | 'ALL') => void
}

export default function SectionBar({ value, onChange }: Props) {
  const tabs: Array<Country | 'ALL'> = ['ALL', ...COUNTRIES]
  return (
    <div className="sectionbar" role="group" aria-label="Filter by country">
      {tabs.map((t) => (
        <button key={t} type="button" className="tab" aria-pressed={value === t} onClick={() => onChange(t)}>
          {t}
        </button>
      ))}
    </div>
  )
}
