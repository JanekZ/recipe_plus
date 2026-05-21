import { Routes, Route } from "react-router-dom";
import MainPage from './components/MainPage/MainPage.tsx';
import MyRecipePage from './components/MyRecipePage/MyRecipePage.tsx';
import MyProductsPage from './components/MyProductsPage/MyProductsPage.tsx';
import RecipeDetail from './components/RecipeDetail/RecipeDetail.tsx';
import UserPage from './components/UserPage/UserPage.tsx';
import './App.css'

function App() {
  return (
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/moje-przepisy" element={<MyRecipePage />} />
        <Route path="/moje-produkty" element={<MyProductsPage />} />
        <Route path="/nowy-przepis" element={<RecipeDetail />} />
        <Route path="/konto" element={<UserPage />} />
      </Routes>
  );
}

export default App
