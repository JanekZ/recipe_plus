import SearchBar from '../SearchBar/SearchBar.tsx'
import RecipeCard from '../RecipeCard/RecipeCard.tsx'
import { recipes } from '../../data/recipes.ts'
import './FoodGallery.css'

interface FoodGalleryProps {
    filter?: 'all' | 'public' | 'private'
    showVisibility?: boolean
}

export default function FoodGallery({ filter = 'all', showVisibility = false }: FoodGalleryProps){
    const filtered = filter === 'all'
        ? recipes
        : recipes.filter(r => filter === 'public' ? r.isPublic : !r.isPublic)

    return (
        <>
            <SearchBar />
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
        </>
    )
}
