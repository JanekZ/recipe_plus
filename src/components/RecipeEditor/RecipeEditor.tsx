import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ActionIcon from '../ActionIcon/ActionIcon.tsx'
import Navbar from '../Navbar/Navbar.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import {
  ACTIONS,
  ACTION_LABELS,
  DIFFICULTY_LABELS,
  STEP_TYPE_LABELS,
  UNITS,
  UNIT_LABELS,
  ApiError,
  productApi,
  recipeApi,
  type ActionType,
  type Difficulty,
  type Ingredient,
  type Product,
  type RecipeInput,
  type Step,
  type StepType,
  type Unit,
} from '../../api'
import { splitSeconds, toSeconds } from '../../utils/time.ts'
import { fileToResizedDataUrl } from '../../utils/image.ts'
import './RecipeEditor.css'

function emptyItem(): Ingredient {
  return { name: '', quantity: 100, unit: 'g', custom: false }
}

function emptyStep(type: StepType): Step {
  if (type === 'action')
    return { type, order: 1, action: 'mix', temperatureC: 0, bladeSpeed: 1, durationSeconds: 30 }
  if (type === 'ingredient') return { type, order: 1, items: [emptyItem()] }
  return { type, order: 1, description: '' }
}

function normalizeStep(s: Step): Step {
  return s.type ? s : { ...s, type: 'action' }
}

const EMPTY: RecipeInput = {
  name: '',
  description: '',
  category: '',
  image: '',
  difficulty: 'medium',
  estimatedTimeSeconds: 0,
  portions: 2,
  isPublic: false,
  ingredients: [],
  steps: [emptyStep('ingredient'), emptyStep('action')],
}

export default function RecipeEditor() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { id } = useParams()
  const editing = Boolean(id)

  const [form, setForm] = useState<RecipeInput>(EMPTY)
  const [products, setProducts] = useState<Product[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  useEffect(() => {
    productApi.list().then(setProducts).catch(() => setProducts([]))
  }, [])


  useEffect(() => {
    if (!id) return
    recipeApi
      .get(id)
      .then((r) =>
        setForm({
          name: r.name,
          description: r.description,
          category: r.category,
          image: r.image,
          difficulty: r.difficulty,
          estimatedTimeSeconds: r.estimatedTimeSeconds,
          portions: r.portions,
          isPublic: r.isPublic,
          ingredients: r.ingredients,
          steps: r.steps.length ? r.steps.map(normalizeStep) : [emptyStep('action')],
        }),
      )
      .catch(() => setError('Nie udało się wczytać przepisu'))
  }, [id])

  const patch = (changes: Partial<RecipeInput>) => setForm((f) => ({ ...f, ...changes }))

  const handleImageFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      patch({ image: await fileToResizedDataUrl(file) })
      setError('')
    } catch {
      setError('Nie udało się wczytać zdjęcia')
    }
  }

  const ingredients: Ingredient[] = useMemo(
    () =>
      form.steps
        .filter((s) => s.type === 'ingredient')
        .flatMap((s) => s.items ?? [])
        .map((it) => ({
          name: it.name ?? '',
          quantity: it.quantity ?? 0,
          unit: (it.unit ?? 'g') as Unit,
          custom: it.custom,
          productId: it.productId,
        })),
    [form.steps],
  )

  const setStep = (index: number, changes: Partial<Step>) =>
    patch({ steps: form.steps.map((s, i) => (i === index ? { ...s, ...changes } : s)) })

  const addStep = (type: StepType) => patch({ steps: [...form.steps, emptyStep(type)] })

  const removeStep = (index: number) =>
    patch({ steps: form.steps.filter((_, i) => i !== index) })

  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= form.steps.length) return
    const next = [...form.steps]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    patch({ steps: next })
  }

  const onDrop = (target: number) => {
    if (dragIndex === null || dragIndex === target) return
    moveStep(dragIndex, target)
    setDragIndex(null)
  }

  const generateDescription = async () => {
    if (ingredients.length === 0) {
      setError('Dodaj krok składnikowy, aby wygenerować opis')
      return
    }
    setAiBusy(true)
    setError('')
    try {
      const result = await recipeApi.describe(
        ingredients.map((i) => i.name).filter(Boolean),
        form.name || undefined,
      )
      patch({ description: result.description })
    } catch {
      setError('Usługa AI jest niedostępna')
    } finally {
      setAiBusy(false)
    }
  }

  const buildEnvelope = () => ({
    format: 'dreamfoodx.recipe',
    formatVersion: '1.0',
    exportedAt: new Date().toISOString(),
    recipe: {
      name: form.name,
      description: form.description,
      category: form.category || 'Inne',
      author: user?.name ?? '',
      language: 'pl',
      difficulty: form.difficulty,
      estimatedTimeSeconds: form.estimatedTimeSeconds,
      portions: form.portions,
      ingredients: ingredients.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        custom: !!i.custom,
      })),
      steps: form.steps.map((s, idx) => ({ ...s, order: idx + 1 })),
    },
  })

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(buildEnvelope(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.name || 'przepis'}.dreamfoodx.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (data.format !== 'dreamfoodx.recipe' || !data.recipe) throw new Error('bad format')
        const r = data.recipe
        setForm((f) => ({
          ...f,
          name: r.name ?? '',
          description: r.description ?? '',
          category: r.category ?? '',
          difficulty: (r.difficulty as Difficulty) ?? 'medium',
          estimatedTimeSeconds: r.estimatedTimeSeconds ?? 0,
          portions: r.portions ?? 1,
          ingredients: [],
          steps: ((r.steps ?? []) as Step[]).map(normalizeStep).map((s, idx) => ({
            ...s,
            order: idx + 1,
          })),
        }))
        setError('')
      } catch {
        setError('Nieprawidłowy plik DreamFoodX')
      }
    }
    reader.readAsText(file)
  }

  const save = async () => {
    if (!form.name.trim()) {
      setError('Podaj nazwę przepisu')
      return
    }
    setBusy(true)
    setError('')
    const payload: RecipeInput = {
      ...form,
      ingredients,
      steps: form.steps.map((s, idx) => ({ ...s, order: idx + 1 })),
    }
    try {
      const saved = editing && id ? await recipeApi.update(id, payload) : await recipeApi.create(payload)
      navigate(`/przepis/${saved._id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nie udało się zapisać przepisu')
    } finally {
      setBusy(false)
    }
  }

  const totalTime = useMemo(() => splitSeconds(form.estimatedTimeSeconds), [form.estimatedTimeSeconds])

  return (
    <>
      <Navbar />
      <div className="editor">
        <div className="editor-header">
          <h1>{editing ? 'Edytuj przepis' : 'Nowy przepis'}</h1>
          <div className="editor-actions">
            <label className="btn ghost">
              Importuj JSON
              <input
                type="file"
                accept="application/json"
                hidden
                onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
              />
            </label>
            <button className="btn ghost" onClick={exportJson} type="button">
              Eksportuj JSON
            </button>
          </div>
        </div>


        {/* ---- Metadata ---- */}
        <section className="editor-card">
          <h2>Podstawowe informacje</h2>
          <div className="field-grid">
            <label className="field">
              <span>Nazwa dania</span>
              <input value={form.name} onChange={(e) => patch({ name: e.target.value })} />
            </label>
            <label className="field">
              <span>Kategoria</span>
              <input value={form.category} onChange={(e) => patch({ category: e.target.value })} />
            </label>
            <label className="field">
              <span>Trudność</span>
              <select
                value={form.difficulty}
                onChange={(e) => patch({ difficulty: e.target.value as Difficulty })}
              >
                {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Porcje</span>
              <input
                type="number"
                min={1}
                value={form.portions}
                onChange={(e) => patch({ portions: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              <span>Czas (min)</span>
              <input
                type="number"
                min={0}
                value={totalTime.minutes}
                onChange={(e) =>
                  patch({ estimatedTimeSeconds: toSeconds(Number(e.target.value), totalTime.seconds) })
                }
              />
            </label>
          </div>

          <label className="field">
            <span>Zdjęcie</span>
            <input type="file" accept="image/*" onChange={handleImageFile} />
          </label>
          {form.image && (
            <div className="image-preview">
              <img src={form.image} alt="Podgląd zdjęcia" />
              <button className="btn ghost" type="button" onClick={() => patch({ image: '' })}>
                Usuń zdjęcie
              </button>
            </div>
          )}

          <label className="field">
            <span>Opis</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </label>
          <button className="btn ai" type="button" onClick={generateDescription} disabled={aiBusy}>
            {aiBusy ? 'Generowanie…' : '✨ Generuj opis z AI'}
          </button>
        </section>

        {/* ---- Ingredients (auto-filled from ingredient steps) ---- */}
        <section className="editor-card">
          <h2>Składniki</h2>
          <p className="muted">
            Lista uzupełnia się automatycznie na podstawie kroków składnikowych.
          </p>
          <ul className="ingredient-list">
            {ingredients.map((ing, i) => (
              <li key={i}>
                <span>
                  {ing.name || '—'} — {ing.quantity} {UNIT_LABELS[ing.unit]}
                  {ing.custom && <em className="custom-badge">własny</em>}
                </span>
              </li>
            ))}
            {ingredients.length === 0 && (
              <li className="muted">Brak składników — dodaj krok składnikowy.</li>
            )}
          </ul>
        </section>

        {/* ---- Steps (drag & drop) ---- */}
        <section className="editor-card">
          <h2>Kroki przygotowania</h2>
          <p className="muted">Przeciągnij krok lub użyj strzałek, aby zmienić kolejność.</p>
          <div className="steps">
            {form.steps.map((step, index) => (
              <StepCard
                key={index}
                index={index}
                step={step}
                total={form.steps.length}
                products={products}
                onChange={(c) => setStep(index, c)}
                onRemove={() => removeStep(index)}
                onMove={(dir) => moveStep(index, index + dir)}
                dragging={dragIndex === index}
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => setDragIndex(null)}
                onDropHere={() => onDrop(index)}
              />
            ))}
          </div>
          <div className="add-step-buttons">
            <button className="btn ghost" type="button" onClick={() => addStep('ingredient')}>
              + Krok składnikowy
            </button>
            <button className="btn ghost" type="button" onClick={() => addStep('action')}>
              + Krok akcyjny
            </button>
            <button className="btn ghost" type="button" onClick={() => addStep('description')}>
              + Krok opisowy
            </button>
          </div>
        </section>

        {/* ---- Save bar ---- */}
        <div className="save-bar">
          <label className="visibility-check">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => patch({ isPublic: e.target.checked })}
            />
            Publiczny przepis
          </label>
          <div className="save-actions">
            <button className="btn ghost" type="button" onClick={() => navigate(-1)}>
              Anuluj
            </button>
            <button className="btn primary" type="button" onClick={save} disabled={busy}>
              {busy ? 'Zapisywanie…' : 'Zapisz przepis'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="modal-overlay" onClick={() => setError('')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Błąd</h3>
            <p className="editor-error-text">{error}</p>
            <div className="modal-actions">
              <button className="btn primary" type="button" onClick={() => setError('')}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface StepCardProps {
  index: number
  step: Step
  total: number
  products: Product[]
  dragging: boolean
  onChange: (changes: Partial<Step>) => void
  onRemove: () => void
  onMove: (dir: 1 | -1) => void
  onDragStart: () => void
  onDragEnd: () => void
  onDropHere: () => void
}

function StepCard({
  index,
  step,
  total,
  products,
  dragging,
  onChange,
  onRemove,
  onMove,
  onDragStart,
  onDragEnd,
  onDropHere,
}: StepCardProps) {
  const type = step.type ?? 'action'

  return (
    <div
      className={`step-card type-${type}${dragging ? ' dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropHere}
    >
      <div className="step-head">
        <span className="drag-handle" title="Przeciągnij">
          ⠿
        </span>
        <span className="step-number">Krok {index + 1}</span>
        <span className="step-type-badge">{STEP_TYPE_LABELS[type]}</span>
        <div className="step-head-actions">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} title="W górę">
            ▲
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            title="W dół"
          >
            ▼
          </button>
          <button type="button" className="danger" onClick={onRemove} title="Usuń">
            ✖
          </button>
        </div>
      </div>

      <div className="step-body">
        {type === 'ingredient' && (
          <IngredientStepBody step={step} products={products} onChange={onChange} />
        )}
        {type === 'action' && <ActionStepBody step={step} onChange={onChange} />}
        {type === 'description' && (
          <label className="field">
            <span>Opis</span>
            <textarea
              rows={2}
              value={step.description ?? ''}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </label>
        )}
      </div>
    </div>
  )
}

function IngredientStepBody({
  step,
  products,
  onChange,
}: {
  step: Step
  products: Product[]
  onChange: (changes: Partial<Step>) => void
}) {
  const items = step.items ?? []

  const setItem = (i: number, changes: Partial<Ingredient>) =>
    onChange({ items: items.map((it, idx) => (idx === i ? { ...it, ...changes } : it)) })

  const setName = (i: number, name: string) => {
    const match = products.find((p) => p.name.toLowerCase() === name.toLowerCase())
    setItem(i, { name, productId: match?._id, custom: match ? match.scope === 'user' : true })
  }

  const addItem = () => onChange({ items: [...items, { name: '', quantity: 100, unit: 'g', custom: false }] })
  const removeItem = (i: number) => onChange({ items: items.filter((_, idx) => idx !== i) })

  return (
    <div className="ingredient-items">
      <datalist id="product-options">
        {products.map((p) => (
          <option key={p._id} value={p.name} />
        ))}
      </datalist>
      {items.map((it, i) => (
        <div className="ingredient-add" key={i}>
          <input
            list="product-options"
            placeholder="Produkt"
            value={it.name ?? ''}
            onChange={(e) => setName(i, e.target.value)}
          />
          <input
            type="number"
            min={0}
            className="ingredient-qty"
            value={it.quantity ?? 0}
            onChange={(e) => setItem(i, { quantity: Number(e.target.value) })}
          />
          <select value={it.unit ?? 'g'} onChange={(e) => setItem(i, { unit: e.target.value as Unit })}>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {UNIT_LABELS[u]}
              </option>
            ))}
          </select>
          {i > 0 && (
            <button
              className="chip-remove"
              type="button"
              onClick={() => removeItem(i)}
              title="Usuń produkt"
            >
              ✖
            </button>
          )}
        </div>
      ))}
      <button className="btn ghost" type="button" onClick={addItem}>
        + Dodaj produkt
      </button>
    </div>
  )
}

function ActionSelect({
  value,
  onChange,
}: {
  value: ActionType
  onChange: (action: ActionType) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className={`action-select${open ? ' open' : ''}`} ref={ref}>
      <button
        type="button"
        className="action-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <ActionIcon action={value} />
        <span className="action-select-value">{ACTION_LABELS[value]}</span>
        <span className="action-select-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div className="action-select-list" role="listbox">
          {ACTIONS.map((a) => (
            <button
              key={a}
              type="button"
              role="option"
              aria-selected={a === value}
              className={`action-select-option${a === value ? ' selected' : ''}`}
              onClick={() => {
                onChange(a)
                setOpen(false)
              }}
            >
              <ActionIcon action={a} />
              <span>{ACTION_LABELS[a]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ActionStepBody({
  step,
  onChange,
}: {
  step: Step
  onChange: (changes: Partial<Step>) => void
}) {
  const { minutes, seconds } = splitSeconds(step.durationSeconds ?? 0)
  return (
    <>
      <div className="field">
        <span>Czynność</span>
        <ActionSelect value={step.action ?? 'mix'} onChange={(action) => onChange({ action })} />
      </div>

      <div className="appliance-params">
        <label className="field">
          <span>🌡️ Temperatura (°C)</span>
          <input
            type="number"
            min={0}
            max={200}
            value={step.temperatureC ?? 0}
            onChange={(e) => onChange({ temperatureC: clamp(Number(e.target.value), 0, 200) })}
          />
        </label>
        <label className="field">
          <span>🔪 Prędkość ostrzy (0–10)</span>
          <input
            type="number"
            min={0}
            max={10}
            value={step.bladeSpeed ?? 1}
            onChange={(e) => onChange({ bladeSpeed: clamp(Number(e.target.value), 0, 10) })}
          />
        </label>
        <label className="field duration">
          <span>⏱️ Czas (MM:SS)</span>
          <div className="duration-inputs">
            <input
              type="number"
              min={0}
              value={minutes}
              onChange={(e) =>
                onChange({ durationSeconds: Math.max(1, toSeconds(Number(e.target.value), seconds)) })
              }
            />
            <span>:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={(e) =>
                onChange({ durationSeconds: Math.max(1, toSeconds(minutes, Number(e.target.value))) })
              }
            />
          </div>
        </label>
      </div>
    </>
  )
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}
