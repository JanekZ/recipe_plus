import RecipeCard from '../RecipeCard/RecipeCard.tsx'
import type { Recipe } from '../../api'
import './FoodGallery.css'

interface FoodGalleryProps {
  recipes: Recipe[]
  loading?: boolean
  showVisibility?: boolean
  emptyText?: string
}

export default function FoodGallery({
  recipes,
  loading = false,
  showVisibility = false,
  emptyText = 'Brak przepisów do wyświetlenia.',
}: FoodGalleryProps) {
  if (loading) return <p className="gallery-status">Wczytywanie przepisów…</p>
  if (recipes.length === 0) return <p className="gallery-status">{emptyText}</p>

  return (
    <div className="gallery-grid">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe._id} recipe={recipe} showVisibility={showVisibility} />
      ))}
    </div>
  )
}
