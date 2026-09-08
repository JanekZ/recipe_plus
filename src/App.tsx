import { Routes, Route } from 'react-router-dom'
import MainPage from './components/MainPage/MainPage.tsx'
import MyRecipePage from './components/MyRecipePage/MyRecipePage.tsx'
import MyProductsPage from './components/MyProductsPage/MyProductsPage.tsx'
import LoginPage from './components/Login/LoginPage.tsx'
import AccountPage from './components/Account/AccountPage.tsx'
import RecipeEditor from './components/RecipeEditor/RecipeEditor.tsx'
import RecipeShowcase from './components/RecipeShowcase/RecipeShowcase.tsx'
import ChatBot from './components/ChatBot/ChatBot.tsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/konto" element={<AccountPage />} />
      <Route path="/moje-przepisy" element={<MyRecipePage />} />
      <Route path="/moje-produkty" element={<MyProductsPage />} />
      <Route path="/nowy-przepis" element={<RecipeEditor />} />
      <Route path="/edytuj-przepis/:id" element={<RecipeEditor />} />
      <Route path="/przepis/:id" element={<RecipeShowcase />} />
      <Route path="/asystent-ai" element={<ChatBot />} />
    </Routes>
  )
}

export default App
