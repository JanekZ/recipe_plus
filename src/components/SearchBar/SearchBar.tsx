import { useState } from 'react'
import type { RecipeSearchParams } from '../../api'
import FilterPopup from '../FilterPopup/FilterPopup.tsx'
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
            <button onClick={() => set({ q: '' })} title="Wyczyść">
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
      </div>

      {showFilters && (
        <FilterPopup
          category={value.category ?? ''}
          author={value.author ?? ''}
          skladniki={value.ingredient ?? ''}
          onCategoryChange={(v) => set({ category: v })}
          onAuthorChange={(v) => set({ author: v })}
          onSkladnikiChange={(v) => set({ ingredient: v })}
          onClear={() => set({ category: '', author: '', ingredient: '' })}
          onClose={() => {
            setShowFilters(false)
            onSearch()
          }}
        />
      )}
    </div>
  )
}
