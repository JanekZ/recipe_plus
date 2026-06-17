import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { recipes } from '../../data/recipes.ts'
import type { ActionType } from '../../data/recipes.ts'
import './RecipeShowcase.css'

export default function RecipeShowcase() {
    const { id } = useParams()
    const navigate = useNavigate()
    const recipe = recipes.find(r => r.id === Number(id))
    const actionLabels: Record<ActionType, string> = {
        akcyjny: 'Akcja',
        składnikowy: 'Składnik',
        opisowy: 'Opis',
    }
    const [timer, setTimer] = useState(0)
    const [maxTime, setMaxTime] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)
    const [isRunning, setIsRunning] = useState(false)

    useEffect(() => {
        if (!recipe) return
        const t = parseInt(recipe.steps[0].time) || 0
        setTimer(t)
        setMaxTime(t)
        setCurrentStep(0)
        setIsRunning(true)
    }, [])

    useEffect(() => {
        if (!recipe) return
        const step = recipe.steps[currentStep]
        if (!step) return
        const t = parseInt(step.time) || 0
        setTimer(t)
        setMaxTime(t)
        setIsRunning(true)
    }, [currentStep])

    useEffect(() => {
        if (timer <= 0 || !isRunning) return
        const interval = setInterval(() => setTimer(t => t - 1), 1000)
        return () => clearInterval(interval)
    }, [timer, isRunning])

    useEffect(() => {
        if (timer === 0 && recipe && maxTime > 0 && currentStep < recipe.steps.length - 1) {
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

    if (!recipe) {
        return (
            <div className="showcase-page">
                <p className="showcase-not-found">Przepis nie znaleziony</p>
                <button className="showcase-back-btn" onClick={() => navigate(-1)}>Wróć</button>
            </div>
        )
    }

    const progress = maxTime > 0 ? (1 - timer / maxTime) * 100 : 0

    return (
        <div className="showcase-page">
            <div className="showcase-progress-bar" style={{ width: `${progress}%` }} />

            <button className="showcase-exit" onClick={() => navigate(`/przepis/${id}`)}>×</button>

            <div className="showcase-body">
                <h1 className="showcase-title">{recipe.name}</h1>

                <p className="showcase-step-label">
                    Krok {currentStep + 1} | {actionLabels[recipe.steps[currentStep].action]}
                </p>

                <p className="showcase-description">
                    {recipe.steps[currentStep].description}
                </p>

                {(recipe.steps[currentStep].ingredient || recipe.steps[currentStep].action === 'składnikowy') && (
                    <p className="showcase-ingredient">
                        Składnik: {recipe.steps[currentStep].ingredient || '—'}
                        {recipe.steps[currentStep].ingredientAmount ? ` ${parseFloat(recipe.steps[currentStep].ingredientAmount)}` : ''}
                    </p>
                )}

                {recipe.steps[currentStep].action === 'akcyjny' && (
                    <>
                        <div className="showcase-meta">
                            {recipe.steps[currentStep].temperature && (
                                <span>🌡️ {recipe.steps[currentStep].temperature}°C</span>
                            )}
                            {recipe.steps[currentStep].speed !== '0' && (
                                <span>⚡ Prędkość: {recipe.steps[currentStep].speed}</span>
                            )}
                        </div>

                        {maxTime > 0 && (
                            <p className="showcase-timer">{formatTime(timer)}</p>
                        )}
                    </>
                )}

                <div className="showcase-controls">
                    <button
                        className="showcase-ctrl-btn"
                        onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                        disabled={currentStep === 0}
                    >
                        &#9664;
                    </button>
                    <button
                        className="showcase-ctrl-btn showcase-ctrl-main"
                        onClick={() => setIsRunning(s => !s)}
                    >
                        {isRunning ? '⏸' : '▶'}
                    </button>
                    <button
                        className="showcase-ctrl-btn"
                        onClick={() => setCurrentStep(s => Math.min(recipe.steps.length - 1, s + 1))}
                        disabled={currentStep === recipe.steps.length - 1}
                    >
                        &#9654;
                    </button>
                </div>

                <div className="showcase-step-dots">
                    {recipe.steps.map((_, i) => (
                        <span
                            key={i}
                            className={`showcase-dot${i === currentStep ? ' active' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
