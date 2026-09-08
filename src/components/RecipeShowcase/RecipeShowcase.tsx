import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../Navbar/Navbar.tsx'
import CookingMode from '../CookingMode/CookingMode.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import {
  ACTION_LABELS,
  DIFFICULTY_LABELS,
  UNIT_LABELS,
  ApiError,
  recipeApi,
  type Recipe,
  type RecipeInput,
} from '../../api'
import { secondsToMMSS } from '../../utils/time.ts'
import './RecipeShowcase.css'

export default function RecipeShowcase() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [delError, setDelError] = useState('')
  const [copying, setCopying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const [cooking, setCooking] = useState(false)

  useEffect(() => {
    if (!id) return
    recipeApi
      .get(id)
      .then(setRecipe)
      .catch(() => setError('Nie znaleziono przepisu lub jest prywatny'))
  }, [id])

  const handleCopy = async () => {
    if (!recipe) return
    setCopying(true)
    setCopyError('')
    try {
      const input: RecipeInput = {
        name: recipe.name,
        description: recipe.description,
        category: recipe.category,
        image: recipe.image,
        difficulty: recipe.difficulty,
        estimatedTimeSeconds: recipe.estimatedTimeSeconds,
        portions: recipe.portions,
        isPublic: false, // copies always land in the user's private recipes
        ingredients: recipe.ingredients,
        steps: recipe.steps,
      }
      await recipeApi.create(input)
      setCopied(true)
    } catch (err) {
      setCopyError(err instanceof ApiError ? err.message : 'Nie udało się skopiować przepisu')
    } finally {
      setCopying(false)
    }
  }

  const handleDelete = async () => {
    if (!recipe) return
    setDeleting(true)
    setDelError('')
    try {
      await recipeApi.remove(recipe._id)
      navigate('/moje-przepisy')
    } catch (err) {
      setDelError(err instanceof ApiError ? err.message : 'Nie udało się usunąć przepisu')
      setDeleting(false)
    }
  }

  if (error) {
    return (
      <>
        <Navbar />
        <p className="showcase-error">{error}</p>
      </>
    )
  }

  if (!recipe) {
    return (
      <>
        <Navbar />
        <p className="showcase-loading">Wczytywanie…</p>
      </>
    )
  }

  const totalMinutes = Math.round(recipe.estimatedTimeSeconds / 60)
  const isOwner = user?.id === recipe.authorId

  return (
    <>
      <Navbar />
      <article className="showcase">
        {/* ---- Start screen ---- */}
        <header className="showcase-hero">
          {recipe.image && <img className="showcase-image" src={recipe.image} alt={recipe.name} />}
          <div className="showcase-hero-body">
            <span className="showcase-category">{recipe.category}</span>
            <h1>{recipe.name}</h1>
            <p className="showcase-description">{recipe.description}</p>
            <div className="showcase-meta">
              <span>🕐 {totalMinutes} min</span>
              <span>👥 {recipe.portions} porcji</span>
              <span>📊 {DIFFICULTY_LABELS[recipe.difficulty]}</span>
              <span>👤 {recipe.authorName}</span>
              <span className={recipe.isPublic ? 'tag-public' : 'tag-private'}>
                {recipe.isPublic ? 'publiczny' : 'prywatny'}
              </span>
            </div>
            <div className="showcase-actions">
              <button
                className="btn primary"
                onClick={() => setCooking(true)}
                disabled={recipe.steps.length === 0}
                title={
                  recipe.steps.length === 0 ? 'Ten przepis nie ma jeszcze kroków' : undefined
                }
              >
                ▶ Rozpocznij gotowanie
              </button>
              <a className="btn ghost" href={recipeApi.exportUrl(recipe._id)} download>
                ⬇ Eksportuj do DreamFoodX
              </a>
              {user && (
                <button
                  className={`btn ${copied ? 'success' : 'ghost'}`}
                  onClick={handleCopy}
                  disabled={copying || copied}
                >
                  {copying
                    ? 'Kopiowanie…'
                    : copied
                      ? '✓ Skopiowano do „Moje Przepisy”'
                      : '📋 Skopiuj przepis'}
                </button>
              )}
              {isOwner && (
                <>
                  <button className="btn ghost" onClick={() => navigate(`/edytuj-przepis/${recipe._id}`)}>
                    Edytuj
                  </button>
                  <button className="btn danger" onClick={() => setConfirmDelete(true)}>
                    Usuń
                  </button>
                </>
              )}
            </div>
            {copyError && <p className="showcase-confirm-error">{copyError}</p>}
          </div>
        </header>

        {/* ---- Ingredients ---- */}
        <section className="showcase-section">
          <h2>Składniki</h2>
          <ul className="showcase-ingredients">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                <span>{ing.name}</span>
                <span className="qty">
                  {ing.quantity} {UNIT_LABELS[ing.unit]}
                </span>
              </li>
            ))}
            {recipe.ingredients.length === 0 && <li className="muted">Brak składników</li>}
          </ul>
        </section>

        {/* ---- Steps ---- */}
        <section className="showcase-section">
          <h2>Przygotowanie</h2>
          <ol className="showcase-steps">
            {recipe.steps.map((step, i) => {
              const type = step.type ?? 'action'
              return (
                <li key={i} className={`showcase-step type-${type}`}>
                  <div className="step-line">
                    <span className="step-badge">{i + 1}</span>
                    {type === 'ingredient' && (
                      <>
                        <span className="step-action">Dodaj składniki</span>
                        <span className="step-text">
                          {(step.items ?? [])
                            .map((it) => `${it.name} ${it.quantity} ${UNIT_LABELS[it.unit]}`)
                            .join(', ')}
                        </span>
                      </>
                    )}
                    {type === 'action' && (
                      <span className="step-action">{ACTION_LABELS[step.action ?? 'mix']}</span>
                    )}
                    {type === 'description' && (
                      <span className="step-text">{step.description}</span>
                    )}
                  </div>
                  {type === 'action' && (
                    <div className="step-params">
                      <span>🌡️ {step.temperatureC ?? 0}°C</span>
                      <span>🔪 {step.bladeSpeed ?? 0}</span>
                      <span>⏱️ {secondsToMMSS(step.durationSeconds ?? 0)}</span>
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      </article>

      {cooking && <CookingMode recipe={recipe} onClose={() => setCooking(false)} />}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => !deleting && setConfirmDelete(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Usunąć przepis „{recipe.name}”?</h3>
            <p className="showcase-confirm-hint">Tej operacji nie można cofnąć.</p>
            {delError && <p className="showcase-confirm-error">{delError}</p>}
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                Anuluj
              </button>
              <button className="btn danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Usuwanie…' : 'Tak, usuń'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
