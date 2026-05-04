import './Navbar.css'

export default function Navbar(){
    return (
        <div className="navbar">
            <img src="src/assets/logo.png" style={{height: '95%'}}/>
            <div className="buttons">
                <button className="tab-button">
                    Przeglądaj
                </button>
                <button className="tab-button">
                    Moje Przepisy
                </button>
                <button className="tab-button">
                    Moje Produkty
                </button>
                <button className="tab-button-bold">
                    + Nowy Przepis
                </button>
            </div>
            <img src="src/assets/user.png" style={{height: '50%'}}/>
        </div>
    )
}
