import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar/Navbar.tsx'
import FoodGallery from '../FoodGallery/FoodGallery.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { recipeApi, type Recipe } from '../../api'
import './MyRecipePage.css'

type VisibilityFilter = 'all' | 'public' | 'private'

export default function MyRecipePage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [filter, setFilter] = useState<VisibilityFilter>('all')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    recipeApi
      .mine()
      .then(setRecipes)
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false))
  }, [user])

  const publicCount = recipes.filter((r) => r.isPublic).length
  const privateCount = recipes.filter((r) => !r.isPublic).length

  const visible =
    filter === 'all'
      ? recipes
      : recipes.filter((r) => (filter === 'public' ? r.isPublic : !r.isPublic))

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
      <FoodGallery
        recipes={visible}
        loading={loading}
        showVisibility={filter === 'all'}
        emptyText="Nie masz jeszcze przepisów. Utwórz pierwszy!"
      />
    </>
  )
}
