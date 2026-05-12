import { useState } from 'react'
import Navbar from "../Navbar/Navbar.tsx"
import SearchBar from "../SearchBar/SearchBar.tsx"
import './MyProductsPage.css'

interface Product {
    id: number
    name: string
    category: string
}

const initialProducts: Product[] = [
    { id: 1, name: 'Marchewka', category: 'warzywa' },
    { id: 2, name: 'Pomidor', category: 'warzywa' },
    { id: 3, name: 'Ogórek', category: 'warzywa' },
    { id: 4, name: 'Cebula', category: 'warzywa' },
    { id: 5, name: 'Papryka', category: 'warzywa' },
    { id: 6, name: 'Jabłko', category: 'owoce' },
    { id: 7, name: 'Banan', category: 'owoce' },
    { id: 8, name: 'Pomarańcza', category: 'owoce' },
    { id: 9, name: 'Truskawka', category: 'owoce' },
    { id: 10, name: 'Winogrona', category: 'owoce' },
    { id: 11, name: 'Kurczak', category: 'mięso' },
    { id: 12, name: 'Wołowina', category: 'mięso' },
    { id: 13, name: 'Wieprzowina', category: 'mięso' },
    { id: 14, name: 'Łosoś', category: 'mięso' },
]

export default function MyProductsPage(){
    const [products, setProducts] = useState(initialProducts)
    const [showModal, setShowModal] = useState(false)
    const [newName, setNewName] = useState('')
    const [newCategory, setNewCategory] = useState('')

    const categories = [...new Set(products.map(p => p.category))]

    const deleteProduct = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id))
    }

    const addProduct = () => {
        if (!newName.trim() || !newCategory.trim()) return
        const nextId = Math.max(...products.map(p => p.id), 0) + 1
        setProducts(prev => [...prev, { id: nextId, name: newName.trim(), category: newCategory.trim() }])
        setNewName('')
        setNewCategory('')
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
                        <h3 className="modal-title">Dodaj produkt</h3>
                        <input
                            className="modal-input"
                            placeholder="Nazwa produktu"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                        />
                        <input
                            className="modal-input"
                            placeholder="Kategoria"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
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
