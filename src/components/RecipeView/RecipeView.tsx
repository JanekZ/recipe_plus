import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../Navbar/Navbar.tsx'
import { recipes } from '../../data/recipes.ts'
import type { ActionType } from '../../data/recipes.ts'
import { getProducts } from '../../data/products.ts'
import './RecipeView.css'

export default function RecipeView(){
    const { id } = useParams()
    const navigate = useNavigate()
    const recipe = recipes.find(r => r.id === Number(id))
    const products = getProducts()

    const actionLabels: Record<ActionType, string> = {
        akcyjny: 'Akcja',
        składnikowy: 'Składnik',
        opisowy: 'Opis',
    }

    const getUnit = (name: string): string => {
        const product = products.find(p => p.name === name)
        return product ? product.unit : ''
    }

    if (!recipe) {
        return (
            <>
                <Navbar />
                <div className="view-container">
                    <p className="view-not-found">Przepis nie znaleziony</p>
                </div>
            </>
        )
    }

    return (
        <>
            <Navbar />
            <div className="view-container">
                <span className="view-tag">{recipe.tag}</span>
                <div className="view-name-row">
                    <h1 className="view-name">{recipe.name}</h1>
                    <button className="start-btn" onClick={() => navigate(`/przepis/${id}/showcase`)}>start</button>
                </div>
                <p className="view-description">{recipe.description}</p>
                <p className="view-author">Autor: {recipe.author}</p>

                <div className="view-time-box">
                    <span>🕐 {recipe.cookingTime} min</span>
                    <span>👥 {recipe.portions} porcji</span>
                </div>

                <div className="view-section">
                    <h2 className="view-section-title">Składniki:</h2>
                    <ul className="view-ingredients">
                        {recipe.ingredients.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div className="view-section">
                    <h2 className="view-section-title">Kroki przygotowania:</h2>
                    {recipe.steps.map((step, i) => (
                        <div key={i} className="view-step-box">
                            <div className="view-step-action-box">
                                <span className="view-step-number">Krok {i + 1}</span>
                                <span className="view-step-action">{actionLabels[step.action]}</span>
                            </div>
                            <p className="view-step-desc">{step.description}</p>
                            {(step.ingredient || step.action === 'składnikowy') && (
                                <p className="view-step-ingredient">
                                    Składnik: {step.ingredient || '—'}{step.ingredient && step.ingredientAmount ? ` ${parseFloat(step.ingredientAmount)} ${getUnit(step.ingredient)}` : ''}
                                </p>
                            )}
                            {step.action === 'akcyjny' && (
                                <div className="view-step-meta">
                                    <span>🌡️ Temperatura: {step.temperature}°C</span>
                                    <span>⚡ Prędkość: {step.speed}</span>
                                    <span>⏱️ Czas: {step.time}s</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </>
    )
}
