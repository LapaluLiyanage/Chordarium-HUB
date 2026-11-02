import type { SortOrder } from '../../data/news'

interface Props {
  sections: string[]
  section: string
  onSection: (v: string) => void
  search: string
  onSearch: (v: string) => void
  sort: SortOrder
  onSort: (v: SortOrder) => void
}

export default function FilterBar({ sections, section, onSection, search, onSearch, sort, onSort }: Props) {
  return (
    <div className="filterbar">
      <input
        type="search"
        className="news-search"
        placeholder="Search headlines"
        aria-label="Search headlines"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <select className="news-sort" aria-label="Sort stories" value={sort} onChange={(e) => onSort(e.target.value as SortOrder)}>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
      <div className="chips" role="group" aria-label="Filter by section">
        {['ALL', ...sections].map((s) => (
          <button key={s} type="button" className="tab" aria-pressed={section === s} onClick={() => onSection(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
