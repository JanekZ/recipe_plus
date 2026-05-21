import { useState } from 'react'
import SearchBar from '../SearchBar/SearchBar.tsx'
import RecipeCard from '../RecipeCard/RecipeCard.tsx'
import FilterPopup from '../FilterPopup/FilterPopup.tsx'
import { recipes } from '../../data/recipes.ts'
import './FoodGallery.css'

interface FoodGalleryProps {
    filter?: 'all' | 'public' | 'private'
    showVisibility?: boolean
    hideSearchBar?: boolean
}

export default function FoodGallery({ filter = 'all', showVisibility = false, hideSearchBar = false }: FoodGalleryProps){
    const [showFilter, setShowFilter] = useState(false)
    const [filterCategory, setFilterCategory] = useState('')
    const [filterAuthor, setFilterAuthor] = useState('')
    const [filterSkladniki, setFilterSkladniki] = useState('')

    const visibilityFiltered = filter === 'all'
        ? recipes
        : recipes.filter(r => filter === 'public' ? r.isPublic : !r.isPublic)

    const filtered = visibilityFiltered.filter(r => {
        const matchCategory = !filterCategory || r.tag.toLowerCase().includes(filterCategory.toLowerCase())
        const matchAuthor = !filterAuthor || r.author.toLowerCase().includes(filterAuthor.toLowerCase())
        const matchSkladniki = !filterSkladniki || r.description.toLowerCase().includes(filterSkladniki.toLowerCase())
        return matchCategory && matchAuthor && matchSkladniki
    })

    const clearFilters = () => {
        setFilterCategory('')
        setFilterAuthor('')
        setFilterSkladniki('')
    }

    return (
        <>
            {!hideSearchBar && <SearchBar onOpenFilter={() => setShowFilter(true)} />}
            <div className="gallery-grid">
                {filtered.map((recipe, index) => (
                    <RecipeCard
                        key={index}
                        image={recipe.image}
                        name={recipe.name}
                        description={recipe.description}
                        tag={recipe.tag}
                        cookingTime={recipe.cookingTime}
                        portions={recipe.portions}
                        author={recipe.author}
                        isPublic={recipe.isPublic}
                        showVisibility={showVisibility}
                    />
                ))}
            </div>
            {showFilter && (
                <FilterPopup
                    onClose={() => setShowFilter(false)}
                    category={filterCategory}
                    author={filterAuthor}
                    skladniki={filterSkladniki}
                    onCategoryChange={setFilterCategory}
                    onAuthorChange={setFilterAuthor}
                    onSkladnikiChange={setFilterSkladniki}
                    onClear={clearFilters}
                />
            )}
        </>
    )
}
