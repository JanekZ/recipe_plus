import { useState } from 'react'
import type { RecipeSearchParams } from '../../api'
import './SearchBar.css'

interface SearchBarProps {
  value: RecipeSearchParams
  onChange: (params: RecipeSearchParams) => void
  onSearch: () => void
}

export default function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  const set = (changes: Partial<RecipeSearchParams>) => onChange({ ...value, ...changes })

  return (
    <div className="bar-container">
      <div className="bar-wrapper">
        <div className="bar-content">
          <div className="input-container">
            <button onClick={onSearch} title="Szukaj">
              🔎
            </button>
            <input
              value={value.q ?? ''}
              placeholder="Szukaj po nazwie"
              onChange={(e) => set({ q: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
            <button onClick={() => onChange({})} title="Wyczyść">
              ✖️
            </button>
          </div>
          <button
            className={`filters-button${showFilters ? ' open' : ''}`}
            onClick={() => setShowFilters((s) => !s)}
          >
            Filtry
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <input
              placeholder="Kategoria"
              value={value.category ?? ''}
              onChange={(e) => set({ category: e.target.value })}
            />
            <input
              placeholder="Autor"
              value={value.author ?? ''}
              onChange={(e) => set({ author: e.target.value })}
            />
            <input
              placeholder="Składnik"
              value={value.ingredient ?? ''}
              onChange={(e) => set({ ingredient: e.target.value })}
            />
            <button className="apply-button" onClick={onSearch}>
              Zastosuj
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
