import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar/Navbar.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { ApiError } from '../../api'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password, name, lastName, nickname)
      navigate('/moje-przepisy')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Coś poszło nie tak')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <h1 className="auth-title">{mode === 'login' ? 'Zaloguj się' : 'Załóż konto'}</h1>

          {mode === 'register' && (
            <>
              <input
                className="auth-input"
                placeholder="Imię"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="auth-input"
                placeholder="Nazwisko"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <input
                className="auth-input"
                placeholder="Pseudonim"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </>
          )}
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Hasło (min. 8 znaków)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? 'Proszę czekać…' : mode === 'login' ? 'Zaloguj' : 'Zarejestruj'}
          </button>

          <p className="auth-switch">
            {mode === 'login' ? 'Nie masz konta?' : 'Masz już konto?'}{' '}
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError('')
              }}
            >
              {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
            </button>
          </p>
        </form>
      </div>
    </>
  )
}
