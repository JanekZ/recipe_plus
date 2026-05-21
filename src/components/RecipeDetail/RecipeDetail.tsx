import { useState, useRef } from 'react'
import Navbar from '../Navbar/Navbar.tsx'
import './RecipeDetail.css'

interface Ingredient {
    id: number
    category: string
    product: string
    quantity: string
}

const skladnikiCategories = ['warzywa', 'owoce', 'mięso', 'nabiał', 'pieczywo', 'inne']

let nextIngredientId = 1

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
                <h3 className="ingredients-title">składniki:</h3>
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
                    <div className="detail-placeholder">
                        <p>Kroki — wkrótce</p>
                    </div>
                )}
            </div>
        </>
    )
}
