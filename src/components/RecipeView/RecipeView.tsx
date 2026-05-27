import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../Navbar/Navbar.tsx'
import { recipes } from '../../data/recipes.ts'
import { getProducts } from '../../data/products.ts'
import './RecipeView.css'

export default function RecipeView(){
    const { id } = useParams()
    const recipe = recipes.find(r => r.id === Number(id))
    const products = getProducts()
    const [showShowcase, setShowShowcase] = useState(false)
    const [timer, setTimer] = useState(0)
    const [maxTime, setMaxTime] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)
    const [isRunning, setIsRunning] = useState(false)

    useEffect(() => {
        if (showShowcase && recipe) {
            setCurrentStep(0)
            const t = parseInt(recipe.steps[0].time) || 0
            setTimer(t)
            setMaxTime(t)
            setIsRunning(true)
        } else {
            setTimer(0)
            setMaxTime(0)
            setCurrentStep(0)
            setIsRunning(false)
        }
    }, [showShowcase])

    useEffect(() => {
        if (!showShowcase || !recipe) return
        const step = recipe.steps[currentStep]
        if (!step) return
        const t = parseInt(step.time) || 0
        setTimer(t)
        setMaxTime(t)
        setIsRunning(true)
    }, [currentStep])

    useEffect(() => {
        if (timer <= 0 || !showShowcase || !isRunning) return
        const id = setInterval(() => setTimer(t => t - 1), 1000)
        return () => clearInterval(id)
    }, [timer, showShowcase, isRunning])

    useEffect(() => {
        if (timer === 0 && showShowcase && recipe && maxTime > 0 && currentStep < recipe.steps.length - 1) {
            const stepTime = parseInt(recipe.steps[currentStep].time) || 0
            if (stepTime !== maxTime) return
            setCurrentStep(s => s + 1)
        }
    }, [timer])

    const formatTime = (s: number): string => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m}:${sec.toString().padStart(2, '0')}`
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
                    <button className="start-btn" onClick={() => setShowShowcase(s => !s)}>start</button>
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
                                <span className="view-step-action">{step.action}</span>
                            </div>
                            <p className="view-step-desc">{step.description}</p>
                            {step.ingredient && (
                                <p className="view-step-ingredient">
                                    Składnik: {step.ingredient}{step.ingredientAmount ? ` ${parseFloat(step.ingredientAmount)} ${getUnit(step.ingredient)}` : ''}
                                </p>
                            )}
                            <div className="view-step-meta">
                                <span>🌡️ Temperatura: {step.temperature}°C</span>
                                <span>⚡ Prędkość: {step.speed}</span>
                                <span>⏱️ Czas: {step.time}s</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showShowcase && (
                <div className="showcase-panel">
                    <div className="showcase-panel-fill" style={{ width: `${maxTime > 0 ? (1 - timer / maxTime) * 100 : 0}%` }} />
                    <div className="showcase-panel-content">
                        <button className="showcase-panel-close" onClick={() => setShowShowcase(false)}>×</button>
                        <h4 className="showcase-panel-name">{recipe.name}</h4>
                        <p className="showcase-panel-action">Krok {currentStep + 1} | {recipe.steps[currentStep].action}</p>
                        <p className="showcase-panel-timer">{formatTime(timer)}</p>
                        <div className="showcase-panel-controls">
                            <button className="showcase-ctrl-btn" onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0}>&#9664;</button>
                            <button className="showcase-ctrl-btn showcase-ctrl-main" onClick={() => setIsRunning(s => !s)}>{isRunning ? '⏸' : '▶'}</button>
                            <button className="showcase-ctrl-btn" onClick={() => setCurrentStep(s => Math.min(recipe.steps.length - 1, s + 1))} disabled={currentStep === recipe.steps.length - 1}>&#9654;</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
