import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar/Navbar.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { ApiError, productApi, type Product } from '../../api'
import './MyProductsPage.css'

export default function MyProductsPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')

  const openModal = () => {
    setNewName('')
    setNewCategory('')
    setModalError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setModalError('')
    setShowModal(false)
  }

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  const load = () => {
    productApi.list().then(setProducts).catch(() => setProducts([]))
  }

  useEffect(() => {
    if (user) load()
  }, [user])

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  )

  const deleteProduct = async (id: string) => {
    try {
      await productApi.remove(id)
      setProducts((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nie udało się usunąć produktu')
    }
  }

  const addProduct = async () => {
    if (!newName.trim() || !newCategory.trim()) {
      setModalError('Podaj nazwę i kategorię produktu')
      return
    }
    try {
      const created = await productApi.create(newName.trim(), newCategory.trim())
      setProducts((prev) => [...prev, created])
      closeModal()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409)
        setModalError('Produkt o tej nazwie już istnieje')
      else setModalError(err instanceof ApiError ? err.message : 'Nie udało się dodać produktu')
    }
  }

  return (
    <>
      <Navbar />
      <div className="add-bar">
        <button className="add-product-btn" onClick={openModal}>
          + Dodaj produkt
        </button>
      </div>
      {error && <p className="products-error">{error}</p>}
      <div className="products-content">
        {categories.map((category) => (
          <div key={category} className="product-section">
            <h2 className="category-title">{category}</h2>
            <div className="product-chips">
              {products
                .filter((p) => p.category === category)
                .map((product) => (
                  <span
                    key={product._id}
                    className={`product-chip${product.scope === 'user' ? ' own' : ''}`}
                  >
                    {product.name}
                    {product.scope === 'global' && <em className="global-badge">globalny</em>}
                    {product.scope === 'user' && (
                      <button className="chip-delete" onClick={() => deleteProduct(product._id)}>
                        ✖
                      </button>
                    )}
                  </span>
                ))}
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="muted">Brak produktów.</p>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Dodaj produkt</h3>
            <input
              className="modal-input"
              placeholder="Nazwa produktu"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="modal-input"
              placeholder="Kategoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            {modalError && <p className="modal-error">{modalError}</p>}
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={closeModal}>
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
