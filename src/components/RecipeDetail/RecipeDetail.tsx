import { useState, useEffect, useRef } from 'react'
import Navbar from '../Navbar/Navbar.tsx'
import { getProducts } from '../../data/products.ts'
import type { Product } from '../../data/products.ts'
import './RecipeDetail.css'

interface Step {
    id: number
    action: string
    description: string
    temperature: string
    speed: string
    time: string
    ingredient: string
    ingredientAmount: string
}

function IngredientsTab({ steps }: { steps: Step[] }){
    const products = getProducts()

    const aggregated = steps
        .filter(s => s.ingredient.trim() && s.ingredientAmount.trim())
        .reduce<Record<string, number>>((acc, s) => {
            const amount = parseFloat(s.ingredientAmount)
            if (isNaN(amount)) return acc
            acc[s.ingredient] = (acc[s.ingredient] || 0) + amount
            return acc
        }, {})

    const getUnit = (name: string): string => {
        const product = products.find(p => p.name === name)
        return product ? product.unit : ''
    }

    return (
        <div>
            <div className="ingredients-header">
                <h3 className="ingredients-title">Składniki:</h3>
            </div>
            {Object.keys(aggregated).length === 0 ? (
                <p className="ingredients-empty">
                    Brak składników — dodaj składniki w krokach.
                </p>
            ) : (
                <div className="ingredients-list">
                    {Object.entries(aggregated).map(([name, total]) => {
                        const unit = getUnit(name)
                        return (
                            <div key={name} className="ingredient-summary-box">
                                <span className="ingredient-summary-name">{name}</span>
                                <span className="ingredient-summary-amount">
                                    {total} {unit}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

function StepsTab({ steps, setSteps }: {
    steps: Step[]
    setSteps: React.Dispatch<React.SetStateAction<Step[]>>
}){
    const products = getProducts()
    const [searchTexts, setSearchTexts] = useState<Record<number, string>>({})
    const [openDropdown, setOpenDropdown] = useState<number | null>(null)
    const containerRefs = useRef<Record<number, HTMLDivElement | null>>({})

    const addStep = () => {
        const nextId = Math.max(...steps.map(s => s.id), 0) + 1
        setSteps(prev => [...prev, { id: nextId, action: '', description: '', temperature: '', speed: '', time: '', ingredient: '', ingredientAmount: '' }])
    }

    const removeStep = (id: number) => {
        setSteps(prev => prev.filter(s => s.id !== id))
    }

    const updateStep = (id: number, field: keyof Step, value: string) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
    }

    const selectProduct = (stepId: number, product: Product) => {
        updateStep(stepId, 'ingredient', product.name)
        setSearchTexts(prev => ({ ...prev, [stepId]: '' }))
        setOpenDropdown(null)
    }

    const handleIngredientInput = (stepId: number, value: string) => {
        updateStep(stepId, 'ingredient', '')
        setSearchTexts(prev => ({ ...prev, [stepId]: value }))
        setOpenDropdown(stepId)
    }

    const getFilteredProducts = (search: string) => {
        if (!search.trim()) return products
        return products.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
        )
    }

    const getProductUnit = (ingredient: string): string | null => {
        if (!ingredient) return null
        const product = products.find(p => p.name === ingredient)
        return product ? product.unit : null
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (openDropdown !== null && containerRefs.current[openDropdown] && !containerRefs.current[openDropdown]!.contains(e.target as Node)) {
                setOpenDropdown(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [openDropdown])

    return (
        <div>
            <div className="ingredients-header">
                <h3 className="ingredients-title">Kroki:</h3>
                <button className="add-ingredient-btn" onClick={addStep}>
                    Dodaj Krok
                </button>
            </div>
            <div className="ingredients-list">
                {steps.map((step, index) => {
                    const search = searchTexts[step.id] ?? ''
                    const filtered = getFilteredProducts(search)
                    const selectedUnit = getProductUnit(step.ingredient)

                    return (
                        <div key={step.id} className="ingredient-box">
                            <button className="ingredient-remove" onClick={() => removeStep(step.id)}>✖</button>
                            <h4 className="step-index">Krok - {index + 1}</h4>
                            <div className="ingredient-fields">
                                <div className="ingredient-field">
                                    <label className="detail-label">Akcja</label>
                                    <input
                                        className="detail-input"
                                        value={step.action}
                                        onChange={e => updateStep(step.id, 'action', e.target.value)}
                                    />
                                </div>
                                <div className="ingredient-field">
                                    <label className="detail-label">Opis</label>
                                    <input
                                        className="detail-input"
                                        value={step.description}
                                        onChange={e => updateStep(step.id, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="ingredient-fields">
                                <div className="ingredient-field">
                                    <label className="detail-label">Temperatura (C)</label>
                                    <input
                                        className="detail-input"
                                        value={step.temperature}
                                        onChange={e => updateStep(step.id, 'temperature', e.target.value)}
                                    />
                                </div>
                                <div className="ingredient-field">
                                    <label className="detail-label">Prędkość noży (0-5)</label>
                                    <input
                                        className="detail-input"
                                        value={step.speed}
                                        onChange={e => updateStep(step.id, 'speed', e.target.value)}
                                    />
                                </div>
                                <div className="ingredient-field">
                                    <label className="detail-label">Czas (sekundy)</label>
                                    <input
                                        className="detail-input"
                                        value={step.time}
                                        onChange={e => updateStep(step.id, 'time', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="ingredient-fields">
                                <div className="ingredient-field" ref={el => { containerRefs.current[step.id] = el }}>
                                    <label className="detail-label">Składnik</label>
                                    <input
                                        className="detail-input"
                                        placeholder="Wybierz lub wpisz..."
                                        value={step.ingredient || search}
                                        onChange={e => handleIngredientInput(step.id, e.target.value)}
                                        onFocus={() => setOpenDropdown(step.id)}
                                    />
                                    {openDropdown === step.id && filtered.length > 0 && (
                                        <ul className="product-dropdown">
                                            {filtered.map(p => (
                                                <li
                                                    key={p.id}
                                                    className="product-dropdown-item"
                                                    onClick={() => selectProduct(step.id, p)}
                                                >
                                                    {p.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="ingredient-field">
                                    <label className="detail-label">Ilość</label>
                                    <div className="quantity-wrapper">
                                        <input
                                            className="detail-input"
                                            type="number"
                                            step="any"
                                            min="0"
                                            placeholder="0"
                                            value={step.ingredientAmount}
                                            onChange={e => updateStep(step.id, 'ingredientAmount', e.target.value)}
                                        />
                                        {selectedUnit && (
                                            <span className="quantity-unit">{selectedUnit}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default function RecipeDetail(){
    const [activeTab, setActiveTab] = useState<'basic' | 'steps' | 'ingredients'>('basic')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [recipeName, setRecipeName] = useState('')
    const [recipeDescription, setRecipeDescription] = useState('')
    const [autoGenerate, setAutoGenerate] = useState(false)
    const [recipeCategory, setRecipeCategory] = useState('')
    const [recipePortions, setRecipePortions] = useState('')
    const [isPublic, setIsPublic] = useState(true)

    const [steps, setSteps] = useState<Step[]>([])

    useEffect(() => {
        const keys = ['recipeName', 'recipeDescription', 'autoGenerate', 'recipeCategory', 'recipePortions', 'isPublic', 'steps']
        keys.forEach(k => sessionStorage.removeItem(k))
    }, [])

    useEffect(() => { sessionStorage.setItem('recipeName', recipeName) }, [recipeName])
    useEffect(() => { sessionStorage.setItem('recipeDescription', recipeDescription) }, [recipeDescription])
    useEffect(() => { sessionStorage.setItem('autoGenerate', String(autoGenerate)) }, [autoGenerate])
    useEffect(() => { sessionStorage.setItem('recipeCategory', recipeCategory) }, [recipeCategory])
    useEffect(() => { sessionStorage.setItem('recipePortions', recipePortions) }, [recipePortions])
    useEffect(() => { sessionStorage.setItem('isPublic', String(isPublic)) }, [isPublic])
    useEffect(() => { sessionStorage.setItem('steps', JSON.stringify(steps)) }, [steps])

    return (
        <>
            <Navbar />
            <div className="detail-container">
                <h1 className="detail-title">Przepis</h1>
                <div className="detail-tabs">
                    <button
                        className={`detail-tab ${activeTab === 'basic' ? 'active' : ''}`}
                        onClick={() => setActiveTab('basic')}
                    >
                        Podstawowe
                    </button>
                    <button
                        className={`detail-tab ${activeTab === 'steps' ? 'active' : ''}`}
                        onClick={() => setActiveTab('steps')}
                    >
                        Kroki
                    </button>
                    <button
                        className={`detail-tab ${activeTab === 'ingredients' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ingredients')}
                    >
                        Składniki
                    </button>
                </div>

                {activeTab === 'basic' && (
                    <div className="detail-basic">
                        <label className="detail-label">Nazwa przepisu</label>
                        <input
                            className="detail-input"
                            placeholder="np. pomidorowa"
                            value={recipeName}
                            onChange={e => setRecipeName(e.target.value)}
                        />

                        <label className="detail-label">Opis</label>
                        <input
                            className="detail-input"
                            placeholder="Dodaj opis"
                            value={recipeDescription}
                            onChange={e => setRecipeDescription(e.target.value)}
                        />

                        <div className="auto-description-box">
                            <div className="auto-description-text">
                                <span className="auto-description-title">Automatyczne wygenerowanie opisu</span>
                                <span className="auto-description-subtitle">
                                    Opis zostanie wygenerowany automatycznie na podstawie nazwy przepisu, składników oraz kroków
                                </span>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={autoGenerate}
                                    onChange={e => setAutoGenerate(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="detail-row">
                            <div className="detail-field">
                                <label className="detail-label">Kategoria</label>
                                <input
                                    className="detail-input"
                                    placeholder="np. obiad"
                                    value={recipeCategory}
                                    onChange={e => setRecipeCategory(e.target.value)}
                                />
                            </div>
                            <div className="detail-field">
                                <label className="detail-label">Liczba porcji</label>
                                <input
                                    className="detail-input"
                                    placeholder="np. 4"
                                    value={recipePortions}
                                    onChange={e => setRecipePortions(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="public-box">
                            <div className="public-box-text">
                                <span className="public-box-title">Przepis publiczny</span>
                                <span className="public-box-subtitle">
                                    Przepis będzie widoczny dla innych użytkowników RECIPE+
                                </span>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={e => setIsPublic(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                        />
                        <button className="image-button" onClick={() => fileInputRef.current?.click()}>
                            + Dodaj zdjęcie
                        </button>
                    </div>
                )}

                {activeTab === 'steps' && (
                    <StepsTab steps={steps} setSteps={setSteps} />
                )}

                {activeTab === 'ingredients' && (
                    <IngredientsTab steps={steps} />
                )}
            </div>
        </>
    )
}
