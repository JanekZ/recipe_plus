import {useState} from 'react';
import './SearchBar.css'

export default function SearchBar(){
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
                <button className="filters-button">
                    Filtry
                </button>
            </div>
        </div>
    )
}
