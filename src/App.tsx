import { Routes, Route } from "react-router-dom";
import MainPage from './components/MainPage/MainPage.tsx';
import MyRecipePage from './components/MyRecipePage/MyRecipePage.tsx';
import MyProductsPage from './components/MyProductsPage/MyProductsPage.tsx';
import './App.css'

function App() {
  return (
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/moje-przepisy" element={<MyRecipePage />} />
        <Route path="/moje-produkty" element={<MyProductsPage />} />
      </Routes>
  );
}

export default App
