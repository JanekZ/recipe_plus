import {useState} from 'react';
import './SearchBar.css'

interface SearchBarProps {
    onOpenFilter?: () => void
}

export default function SearchBar({ onOpenFilter }: SearchBarProps){
    const [searchText, setSearchText] = useState('');

return(
        <div className="bar-container">
            <div className="bar-content">
                <div className="input-container">
                    <button 
                        onClick={() => console.log(searchText)}
                    >
                        🔎
                    </button>
                    <input 
                        value={searchText}
                        placeholder="Szukaj"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <button 
                        onClick={() => setSearchText('')}
                    >
                        ✖️
                    </button>
                </div>
                <button className="filters-button" onClick={onOpenFilter}>
                    Filtry
                </button>
            </div>
        </div>
    )
}
