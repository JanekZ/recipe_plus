import { useState } from 'react'
import Navbar from "../Navbar/Navbar.tsx"
import FoodGallery from "../FoodGallery/FoodGallery.tsx"
import { recipes } from "../../data/recipes.ts"
import './MyRecipePage.css'

type VisibilityFilter = 'all' | 'public' | 'private'

export default function MyRecipePage(){
    const [filter, setFilter] = useState<VisibilityFilter>('all')

    const publicCount = recipes.filter(r => r.isPublic).length
    const privateCount = recipes.filter(r => !r.isPublic).length

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
            <FoodGallery filter={filter} showVisibility={filter === 'all'} />
        </>
    )
}
