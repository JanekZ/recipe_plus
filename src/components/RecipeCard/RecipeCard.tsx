import { useNavigate } from 'react-router-dom'
import './RecipeCard.css'

const MAX_DESC_WORDS = 50

interface RecipeCardProps {
    id: number
    image: string
    name: string
    description: string
    tag: string
    cookingTime: number
    portions: number
    author: string
    isPublic: boolean
    showVisibility?: boolean
}

function truncateWords(text: string, maxWords: number){
    const words = text.split(' ')
    if (words.length <= maxWords) return text
    return words.slice(0, maxWords).join(' ') + '...'
}

export default function RecipeCard({ id, image, name, description, tag, cookingTime, portions, author, isPublic, showVisibility = false }: RecipeCardProps){
    const navigate = useNavigate()
    return (
        <div className="recipe-card" onClick={() => navigate(`/przepis/${id}`)}>
            <img className="recipe-image" src={image} alt={name} />
            <div className="recipe-content">
                <div className="recipe-tags">
                    <span className="recipe-tag">{tag}</span>
                    {showVisibility && (
                        <span className={`recipe-visibility ${isPublic ? 'public' : 'private'}`}>
                            {isPublic ? 'publiczne' : 'prywatne'}
                        </span>
                    )}
                </div>
                <h3 className="recipe-name">{name}</h3>
                <p className="recipe-description">{truncateWords(description, MAX_DESC_WORDS)}</p>
                <div className="recipe-meta">
                    <span className="meta-item">🕐 {cookingTime} min</span>
                    <span className="meta-item">👥 {portions}</span>
                </div>
                <p className="recipe-author">Autor: {author}</p>
            </div>
        </div>
    )
}
