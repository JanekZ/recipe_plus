import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from "../Navbar/Navbar.tsx"
import SearchBar from "../SearchBar/SearchBar.tsx"
import FoodGallery from "../FoodGallery/FoodGallery.tsx"
import { recipes } from "../../data/recipes.ts"
import './MyRecipePage.css'

type VisibilityFilter = 'all' | 'public' | 'private'

export default function MyRecipePage(){
    const navigate = useNavigate()
    const [filter, setFilter] = useState<VisibilityFilter>('all')

    const publicCount = recipes.filter(r => r.isPublic).length
    const privateCount = recipes.filter(r => !r.isPublic).length

    const showEmpty = (filter === 'public' && publicCount === 0) || (filter === 'private' && privateCount === 0)
    const emptyMessage = filter === 'private'
        ? 'Nie masz jeszcze żadnego prywatnego przepisu'
        : 'Nie masz jeszcze żadnego publicznego przepisu'

    return (
        <>
            <Navbar />
            <div className="visibility-toggle">
                <div className="toggle-group">
                    <button
                        className={`toggle-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        wszystkie
                    </button>
                    <button
                        className={`toggle-btn ${filter === 'public' ? 'active' : ''}`}
                        onClick={() => setFilter('public')}
                    >
                        publiczne ({publicCount})
                    </button>
                    <button
                        className={`toggle-btn ${filter === 'private' ? 'active' : ''}`}
                        onClick={() => setFilter('private')}
                    >
                        prywatne ({privateCount})
                    </button>
                </div>
            </div>
            <SearchBar />
            {showEmpty ? (
                <div className="empty-recipes">
                    <p>{emptyMessage}</p>
                    <button onClick={() => navigate('/nowy-przepis')}>Dodaj przepis</button>
                </div>
            ) : (
                <FoodGallery filter={filter} showVisibility={filter === 'all'} hideSearchBar />
            )}
        </>
    )
}
