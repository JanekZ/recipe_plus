import './FilterPopup.css'

interface FilterPopupProps {
    onClose: () => void
    category: string
    author: string
    skladniki: string
    onCategoryChange: (v: string) => void
    onAuthorChange: (v: string) => void
    onSkladnikiChange: (v: string) => void
    onClear: () => void
}

export default function FilterPopup({
    onClose,
    category,
    author,
    skladniki,
    onCategoryChange,
    onAuthorChange,
    onSkladnikiChange,
    onClear
}: FilterPopupProps){
    return (
        <div className="filter-overlay" onClick={onClose}>
            <div className="filter-panel" onClick={e => e.stopPropagation()}>
                <div className="filter-header">
                    <h2>Filtry wyszukiwania</h2>
                    <button className="filter-close" onClick={onClose}>✖</button>
                </div>
                <p className="filter-subtitle">Zawez wyniki wyszukiwania według różnych kryteriów</p>
                <div className="filter-inputs">
                    <label>Kategorie</label>
                    <input
                        value={category}
                        onChange={(e) => onCategoryChange(e.target.value)}
                    />
                    <label>Autor</label>
                    <input
                        value={author}
                        onChange={(e) => onAuthorChange(e.target.value)}
                    />
                    <label>Składniki</label>
                    <input
                        value={skladniki}
                        onChange={(e) => onSkladnikiChange(e.target.value)}
                    />
                </div>
                <button className="filter-clear" onClick={onClear}>Wyczyść filtry</button>
            </div>
        </div>
    )
}
