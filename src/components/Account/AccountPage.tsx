import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar/Navbar.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { ApiError, authApi, productApi, recipeApi } from '../../api'
import './AccountPage.css'

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading, logout } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwBusy, setPwBusy] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false)
  const [delError, setDelError] = useState('')
  const [delBusy, setDelBusy] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  if (!user) return <Navbar />

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (newPassword.length < 8) {
      setPwError('Nowe hasło musi mieć co najmniej 8 znaków')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Nowe hasła nie są takie same')
      return
    }
    setPwBusy(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      logout()
      navigate('/login')
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : 'Nie udało się zmienić hasła')
    } finally {
      setPwBusy(false)
    }
  }

  const deleteAccount = async () => {
    setDelBusy(true)
    setDelError('')
    try {
      await recipeApi.deleteMine()
      await productApi.deleteMine()
      await authApi.deleteAccount()
      logout()
      navigate('/')
    } catch (err) {
      setDelError(err instanceof ApiError ? err.message : 'Nie udało się usunąć konta')
      setDelBusy(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="account">
        <h1>Moje konto</h1>

        {/* ---- Account data ---- */}
        <section className="account-card">
          <h2>Dane konta</h2>
          <div className="account-field">
            <span className="account-label">Imię</span>
            <span className="account-value">{user.name}</span>
          </div>
          <div className="account-field">
            <span className="account-label">Nazwisko</span>
            <span className="account-value">{user.lastName}</span>
          </div>
          <div className="account-field">
            <span className="account-label">Pseudonim</span>
            <span className="account-value">{user.nickname}</span>
          </div>
          <div className="account-field">
            <span className="account-label">Email</span>
            <span className="account-value">{user.email}</span>
          </div>
        </section>

        {/* ---- Change password ---- */}
        <section className="account-card">
          <h2>Zmień hasło</h2>
          <form className="account-form" onSubmit={submitPassword}>
            <input
              className="account-input"
              type="password"
              placeholder="Obecne hasło"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              className="account-input"
              type="password"
              placeholder="Nowe hasło (min. 8 znaków)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
            <input
              className="account-input"
              type="password"
              placeholder="Powtórz nowe hasło"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {pwError && <p className="account-error">{pwError}</p>}
            <button className="btn primary" type="submit" disabled={pwBusy}>
              {pwBusy ? 'Zmienianie…' : 'Zmień hasło'}
            </button>
          </form>
        </section>

        {/* ---- Delete account ---- */}
        <section className="account-card danger-zone">
          <h2>Usuń konto</h2>
          <p className="account-hint">
            Tej operacji nie można cofnąć. Usunięte zostaną Twoje konto oraz wszystkie Twoje
            przepisy i produkty.
          </p>
          <button className="btn danger" onClick={() => setShowConfirm(true)}>
            Usuń konto
          </button>
        </section>
      </div>

      {showConfirm && (
        <div className="modal-overlay" onClick={() => !delBusy && setShowConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Czy na pewno chcesz usunąć konto?</h3>
            <p className="account-hint">
              Konto <strong>{user.email}</strong> oraz wszystkie powiązane dane zostaną trwale
              usunięte.
            </p>
            {delError && <p className="account-error">{delError}</p>}
            <div className="modal-actions">
              <button
                className="btn ghost"
                onClick={() => setShowConfirm(false)}
                disabled={delBusy}
              >
                Anuluj
              </button>
              <button className="btn danger" onClick={deleteAccount} disabled={delBusy}>
                {delBusy ? 'Usuwanie…' : 'Tak, usuń konto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
