import { useState, useRef } from 'react'
import Navbar from '../Navbar/Navbar.tsx'
import './RecipeDetail.css'

interface Ingredient {
    id: number
    category: string
    product: string
    quantity: string
}

interface Step {
    id: number
    action: string
    description: string
    temperature: string
    speed: string
    time: string
}

const skladnikiCategories = ['warzywa', 'owoce', 'mięso', 'nabiał', 'pieczywo', 'inne']

let nextIngredientId = 1
let nextStepId = 1

function IngredientsTab(){
    const [ingredients, setIngredients] = useState<Ingredient[]>([])

    const addIngredient = () => {
        setIngredients(prev => [...prev, { id: nextIngredientId++, category: skladnikiCategories[0], product: '', quantity: '' }])
    }

    const removeIngredient = (id: number) => {
        setIngredients(prev => prev.filter(i => i.id !== id))
    }

    const updateIngredient = (id: number, field: keyof Ingredient, value: string) => {
        setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
    }

    return (
        <div>
            <div className="ingredients-header">
                <h3 className="ingredients-title">Składniki:</h3>
                <button className="add-ingredient-btn" onClick={addIngredient}>
                    Dodaj składnik
                </button>
            </div>
            <div className="ingredients-list">
                {ingredients.map(ing => (
                    <div key={ing.id} className="ingredient-box">
                        <button className="ingredient-remove" onClick={() => removeIngredient(ing.id)}>✖</button>
                        <div className="ingredient-fields">
                            <div className="ingredient-field">
                                <label className="detail-label">Kategoria</label>
                                <select
                                    className="detail-input"
                                    value={ing.category}
                                    onChange={e => updateIngredient(ing.id, 'category', e.target.value)}
                                >
                                    {skladnikiCategories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="ingredient-field">
                                <label className="detail-label">Produkt</label>
                                <input
                                    className="detail-input"
                                    value={ing.product}
                                    onChange={e => updateIngredient(ing.id, 'product', e.target.value)}
                                />
                            </div>
                            <div className="ingredient-field">
                                <label className="detail-label">Ilość</label>
                                <input
                                    className="detail-input"
                                    value={ing.quantity}
                                    onChange={e => updateIngredient(ing.id, 'quantity', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="ingredient-summary">
                            {ing.quantity} {ing.product}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function StepsTab(){
    const [steps, setSteps] = useState<Step[]>([])

    const addStep = () => {
        setSteps(prev => [...prev, { id: nextStepId++, action: '', description: '', temperature: '', speed: '', time: '' }])
    }

    const removeStep = (id: number) => {
        setSteps(prev => prev.filter(s => s.id !== id))
    }

    const updateStep = (id: number, field: keyof Step, value: string) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
    }

    return (
        <div>
            <div className="ingredients-header">
                <h3 className="ingredients-title">Kroki:</h3>
                <button className="add-ingredient-btn" onClick={addStep}>
                    Dodaj Krok
                </button>
            </div>
            <div className="ingredients-list">
                {steps.map((step, index) => (
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
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function RecipeDetail(){
    const [activeTab, setActiveTab] = useState<'basic' | 'ingredients' | 'steps'>('basic')
    const [autoGenerate, setAutoGenerate] = useState(false)
    const [isPublic, setIsPublic] = useState(true)
    const fileInputRef = useRef<HTMLInputElement>(null)

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
                        className={`detail-tab ${activeTab === 'ingredients' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ingredients')}
                    >
                        Składniki
                    </button>
                    <button
                        className={`detail-tab ${activeTab === 'steps' ? 'active' : ''}`}
                        onClick={() => setActiveTab('steps')}
                    >
                        Kroki
                    </button>
                </div>

                {activeTab === 'basic' && (
                    <div className="detail-basic">
                        <label className="detail-label">Nazwa przepisu</label>
                        <input
                            className="detail-input"
                            placeholder="np. pomidorowa"
                        />

                        <label className="detail-label">Opis</label>
                        <input
                            className="detail-input"
                            placeholder="Dodaj opis"
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
                                />
                            </div>
                            <div className="detail-field">
                                <label className="detail-label">Liczba porcji</label>
                                <input
                                    className="detail-input"
                                    placeholder="np. 4"
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

                {activeTab === 'ingredients' && (
                    <IngredientsTab />
                )}

                {activeTab === 'steps' && (
                    <StepsTab />
                )}
            </div>
        </>
    )
}
