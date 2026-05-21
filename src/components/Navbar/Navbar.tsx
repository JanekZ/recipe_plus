import { useNavigate, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar(){
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="navbar">
            <img src="src/assets/logo.png" style={{height: '95%'}}/>
            <div className="buttons">
                <button
                    className={`tab-button${location.pathname === '/' ? ' active' : ''}`}
                    onClick={() => navigate('/')}
                >
                    Przeglądaj
                </button>
                <button
                    className={`tab-button${location.pathname === '/moje-przepisy' ? ' active' : ''}`}
                    onClick={() => navigate('/moje-przepisy')}
                >
                    Moje Przepisy
                </button>
                <button
                    className={`tab-button${location.pathname === '/moje-produkty' ? ' active' : ''}`}
                    onClick={() => navigate('/moje-produkty')}
                >
                    Moje Produkty
                </button>
                <button className="tab-button-bold" onClick={() => navigate('/nowy-przepis')}>
                    + Nowy Przepis
                </button>
            </div>
            <img src="src/assets/user.png" style={{height: '50%'}}/>
        </div>
    )
}
