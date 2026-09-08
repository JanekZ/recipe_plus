import { useNavigate } from 'react-router-dom'
import type { Recipe } from '../../api'
import './RecipeCard.css'

const PLACEHOLDER = 'https://placehold.co/400x300/F17939/white?text=DreamFoodX'

interface RecipeCardProps {
  recipe: Recipe
  showVisibility?: boolean
}

export default function RecipeCard({ recipe, showVisibility = false }: RecipeCardProps) {
  const navigate = useNavigate()
  const minutes = Math.round(recipe.estimatedTimeSeconds / 60)

  return (
    <div className="recipe-card" onClick={() => navigate(`/przepis/${recipe._id}`)}>
      <img className="recipe-image" src={recipe.image || PLACEHOLDER} alt={recipe.name} />
      <div className="recipe-content">
        <div className="recipe-tags">
          <span className="recipe-tag">{recipe.category}</span>
          {showVisibility && (
            <span className={`recipe-visibility ${recipe.isPublic ? 'public' : 'private'}`}>
              {recipe.isPublic ? 'publiczne' : 'prywatne'}
            </span>
          )}
        </div>
        <h3 className="recipe-name">{recipe.name}</h3>
        <p className="recipe-description">{recipe.description}</p>
        <div className="recipe-meta">
          <span className="meta-item">🕐 {minutes} min</span>
          <span className="meta-item">👥 {recipe.portions}</span>
        </div>
        <p className="recipe-author">Autor: {recipe.authorName}</p>
      </div>
    </div>
  )
}
