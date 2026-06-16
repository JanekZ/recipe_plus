import { useCallback, useEffect, useState } from 'react'
import Navbar from '../Navbar/Navbar.tsx'
import SearchBar from '../SearchBar/SearchBar.tsx'
import FoodGallery from '../FoodGallery/FoodGallery.tsx'
import { recipeApi, type Recipe, type RecipeSearchParams } from '../../api'
import './MainPage.css'

export default function MainPage() {
  const [params, setParams] = useState<RecipeSearchParams>({})
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  const runSearch = useCallback((search: RecipeSearchParams) => {
    setLoading(true)
    recipeApi
      .search(search)
      .then(setRecipes)
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false))
  }, [])

  // Initial load of the public showcase.
  useEffect(() => {
    runSearch({})
  }, [runSearch])

  return (
    <>
      <Navbar />
      <div className="promotional-banner">
        <div className="promo-text">
          <h1>System Przepisów DreamFoodX</h1>
          <h2>Twórz i udostępniaj przepisy dla użytkowników urządzeń DreamFoodX</h2>
        </div>
      </div>
      <SearchBar value={params} onChange={setParams} onSearch={() => runSearch(params)} />
      <FoodGallery
        recipes={recipes}
        loading={loading}
        emptyText="Nie znaleziono przepisów spełniających kryteria."
      />
    </>
  )
}
