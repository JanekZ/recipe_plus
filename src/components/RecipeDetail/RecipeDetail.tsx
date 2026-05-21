import { useState, useRef } from 'react'
import Navbar from '../Navbar/Navbar.tsx'
import './RecipeDetail.css'

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
                    <div className="detail-placeholder">
                        <p>Składniki — wkrótce</p>
                    </div>
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
