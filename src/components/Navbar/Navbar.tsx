import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.tsx'
import logo from '../../assets/logo.png'
import userIcon from '../../assets/user.png'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const tab = (path: string, label: string) => (
    <button
      className={`tab-button${location.pathname === path ? ' active' : ''}`}
      onClick={() => navigate(path)}
    >
      {label}
    </button>
  )

  return (
    <div className="navbar">
      <img src={logo} style={{ height: '95%', cursor: 'pointer' }} onClick={() => navigate('/')} />
      <div className="buttons">
        {tab('/', 'Przeglądaj')}
        {tab('/moje-przepisy', 'Moje Przepisy')}
        {tab('/moje-produkty', 'Moje Produkty')}
        <button className="tab-button-bold" onClick={() => navigate('/nowy-przepis')}>
          + Nowy Przepis
        </button>
      </div>
      <div className="navbar-user">
        {user ? (
          <>
            <button className="user-link" onClick={() => navigate('/konto')} title="Moje konto">
              <img src={userIcon} style={{ height: '2rem' }} />
              <span className="user-name">{user.nickname}</span>
            </button>
            <button className="tab-button" onClick={logout}>
              Wyloguj
            </button>
          </>
        ) : (
          <button className="tab-button" onClick={() => navigate('/login')}>
            Zaloguj
          </button>
        )}
      </div>
    </div>
  )
}
