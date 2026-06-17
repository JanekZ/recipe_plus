import { useState } from "react";
import Navbar from "../Navbar/Navbar.tsx";
import "./ChatBot.css";

interface RecipeStep {
  type: "action" | "ingredient" | "description";
  action?: string;
  temperatureC?: number;
  bladeSpeed?: number;
  durationSeconds?: number;
  description?: string;
  items?: any[];
}

interface GeneratedRecipe {
  name: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedTimeSeconds: number;
  portions: number;
  isPublic: boolean;
  steps: RecipeStep[];
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  recipeData?: GeneratedRecipe;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Cześć! Jestem Twoim inteligentnym asystentem kuchennym DreamFoodX. Napisz mi, co masz w lodówce lub co chcesz ugotować, a stworzę dla Ciebie idealny przepis!",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Стабильный прямой адрес к бэкенду ИИ на локальной машине Windows
  const AI_SERVICE_URL = "http://localhost:8000/chat/generate";
  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue("");
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: userText, sender: "user" },
    ]);

    try {
      const response = await fetch(AI_SERVICE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText }),
      });

      if (!response.ok) throw new Error("Błąd odpowiedzi serwera AI");

      const recipeData: GeneratedRecipe = await response.json();

      // Проверка на то, что объект вообще распарсился корректно
      if (!recipeData || !recipeData.name) {
        throw new Error("Zwrócony przepis ma nieprawidłową strukturę danych.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `Stworzyłem przepis na: **${recipeData.name}**! \n\n${recipeData.description}\n\nLiczba kroków: ${recipeData.steps ? recipeData.steps.length : 0}. Możesz teraz zapisać go w bazie danych MongoDB.`,
          sender: "bot",
          recipeData: recipeData,
        },
      ]);
    } catch (error) {
      console.error("Błąd komunikacji z AI:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Ups! Coś poszło nie tak podczas generowania przepisu. Wygląda na to, że nasz Szef Kuchni AI ma teraz przerwę. Spróbuj ponownie za chwilę lub skontaktuj się z administratorem.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecipeToDatabase = async (recipe: GeneratedRecipe) => {
    try {
      const recipeToSave = {
        ...recipe,
        image: `https://placehold.co/400x300/F17939/white?text=${encodeURIComponent(recipe.name)}`,
        ingredients: recipe.steps
          ? recipe.steps
              .filter((s) => s.type === "description" && s.description)
              .map((s) => s.description!)
          : [],
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/api/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(recipeToSave),
      });

      if (!response.ok) throw new Error("Nie udało się zapisać przepisu");

      alert(
        `Sukces! Przepis "${recipe.name}" został pomyślnie zapisany w MongoDB!`,
      );
    } catch (error) {
      console.error("Błąd zapisu:", error);
      alert("Wystąpiл problem z zapisem w bazie danych MongoDB.");
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              <div className="message-bubble">
                <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>
                {msg.recipeData && (
                  <button
                    className="save-recipe-btn"
                    onClick={() => saveRecipeToDatabase(msg.recipeData!)}
                  >
                    💾 Zapisz przepis w "Moje Przepisy"
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper bot">
              <div className="message-bubble loading">
                Szef kuchni DreamFoodX myśli... 🍳
              </div>
            </div>
          )}
        </div>
        <div className="chat-input-area">
          <input
            type="text"
            placeholder={
              isLoading ? "Generowanie..." : "Napisz do asystenta..."
            }
            value={inputValue}
            disabled={isLoading}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? "..." : "Wyślij"}
          </button>
        </div>
      </div>
    </div>
  );
}
