import { useState } from 'react'
import Navbar from "../Navbar/Navbar.tsx"
import SearchBar from "../SearchBar/SearchBar.tsx"
import './MyProductsPage.css'

interface Product {
    id: number
    name: string
    category: string
    unit: string
}

const categories = ['warzywa', 'owoce', 'mięso', 'nabiał', 'pieczywo', 'inne']

const initialProducts: Product[] = [
    { id: 1, name: 'Marchewka', category: 'warzywa', unit: 'kg' },
    { id: 2, name: 'Pomidor', category: 'warzywa', unit: 'kg' },
    { id: 3, name: 'Ogórek', category: 'warzywa', unit: 'szt' },
    { id: 4, name: 'Cebula', category: 'warzywa', unit: 'kg' },
    { id: 5, name: 'Papryka', category: 'warzywa', unit: 'kg' },
    { id: 6, name: 'Jabłko', category: 'owoce', unit: 'kg' },
    { id: 7, name: 'Banan', category: 'owoce', unit: 'kg' },
    { id: 8, name: 'Pomarańcza', category: 'owoce', unit: 'kg' },
    { id: 9, name: 'Truskawka', category: 'owoce', unit: 'kg' },
    { id: 10, name: 'Winogrona', category: 'owoce', unit: 'kg' },
    { id: 11, name: 'Kurczak', category: 'mięso', unit: 'kg' },
    { id: 12, name: 'Wołowina', category: 'mięso', unit: 'kg' },
    { id: 13, name: 'Wieprzowina', category: 'mięso', unit: 'kg' },
    { id: 14, name: 'Łosoś', category: 'mięso', unit: 'kg' },
]

export default function MyProductsPage(){
    const [products, setProducts] = useState(initialProducts)
    const [showModal, setShowModal] = useState(false)
    const [newName, setNewName] = useState('')
    const [newCategory, setNewCategory] = useState('inne')
    const [newUnit, setNewUnit] = useState('')

    const deleteProduct = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id))
    }

    const addProduct = () => {
        if (!newName.trim() || !newUnit.trim()) return
        const nextId = Math.max(...products.map(p => p.id), 0) + 1
        setProducts(prev => [...prev, { id: nextId, name: newName.trim(), category: newCategory, unit: newUnit.trim() }])
        setNewName('')
        setNewCategory(categories[0])
        setNewUnit('')
        setShowModal(false)
    }

    return (
        <>
            <Navbar />
            <SearchBar />
            <div className="add-bar">
                <button className="add-product-btn" onClick={() => setShowModal(true)}>
                    + Dodaj produkt
                </button>
            </div>
            <div className="products-content">
                {categories.map(category => (
                    <div key={category} className="product-section">
                        <h2 className="category-title">{category}</h2>
                        <div className="product-chips">
                            {products
                                .filter(p => p.category === category)
                                .map(product => (
                                    <span key={product.id} className="product-chip">
                                        {product.name}
                                        <button
                                            className="chip-delete"
                                            onClick={() => deleteProduct(product.id)}
                                        >
                                            ✖
                                        </button>
                                    </span>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Dodaj Nowy Produkt</h3>
                        <label className="modal-label">Nazwa produktu</label>
                        <input
                            className="modal-input"
                            placeholder="np: pomidor"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                        />
                        <label className="modal-label">Kategoria</label>
                        <select
                            className="modal-input"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                        >
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <label className="modal-label">Jednostka</label>
                        <input
                            className="modal-input"
                            placeholder="np: kg,ml,szt"
                            value={newUnit}
                            onChange={e => setNewUnit(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setShowModal(false)}>
                                Anuluj
                            </button>
                            <button className="modal-btn confirm" onClick={addProduct}>
                                Dodaj
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
