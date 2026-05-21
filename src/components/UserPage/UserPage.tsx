import { useState } from 'react'
import Navbar from '../Navbar/Navbar.tsx'
import './UserPage.css'

export default function UserPage(){
    const [name, setName] = useState('Jan Kowalski')
    const [email, setEmail] = useState('jan@example.com')
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    return (
        <>
            <Navbar />
            <div className="user-page">
                <h1 className="user-title">Dane konta</h1>
                <div className="user-card">
                    <label className="detail-label">Nazwa</label>
                    <input
                        className="detail-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />

                    <label className="detail-label">Email</label>
                    <input
                        className="detail-input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />

                    <label className="detail-label">Zmień hasło</label>
                    <input
                        className="detail-input"
                        type="password"
                        placeholder="Stare hasło"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                    />
                    <input
                        className="detail-input"
                        type="password"
                        placeholder="Nowe hasło"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                    />
                    <input
                        className="detail-input"
                        type="password"
                        placeholder="Potwierdź nowe hasło"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />

                    <button className="save-btn">💾 Zapisz zmiany</button>

                    <div className="deactivation-row">
                        <button className="deactivate-btn">Dezaktywuj konto</button>
                        <span className="deactivate-text">
                            Dezaktywacja konta spowoduje usunięcie wszystkich danych z tej strony internetowej wraz z twoimi przepisami publicznymi
                        </span>
                    </div>
                </div>
            </div>
        </>
    )
}
