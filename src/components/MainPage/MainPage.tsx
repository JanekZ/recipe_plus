import Navbar from "../Navbar/Navbar.tsx"
import FoodGallery from "../FoodGallery/FoodGallery.tsx"
import './MainPage.css'

export default function MainPage(){
    return (
        <>
            <Navbar />
            <div className="promotional-banner">
                <div className="promo-text">
                    <h1>System Przepisów DreamFoodX</h1>
                    <h2>Twórz i udostępniaj przepisy dla użytkowników urządzeń DreamFoodX</h2>
                </div>
            </div>
            <FoodGallery />
        </>
    )
}
