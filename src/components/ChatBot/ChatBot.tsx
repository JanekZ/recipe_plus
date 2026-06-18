import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import {
    ACTIONS,
    ApiError,
    recipeApi,
    UNITS,
    type ActionType,
    type RecipeInput,
    type Step,
    type Unit,
} from "../../api";
import { AI_URL } from "../../api/config.ts";
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
    savedId?: string;
}

// Map common AI action words (EN/PL synonyms) onto the backend's allowed enum.
const ACTION_SYNONYMS: Record<string, ActionType> = {
    stir: "mix", whisk: "mix", combine: "mix", mieszanie: "mix",
    boil: "cook", simmer: "cook", bake: "cook", roast: "cook", stew: "cook", gotowanie: "cook",
    saute: "fry", "sauté": "fry", sear: "fry", smażenie: "fry", smazenie: "fry",
    cut: "chop", dice: "chop", slice: "chop", mince: "chop", siekanie: "chop",
    puree: "blend", "purée": "blend", grind: "blend", blendowanie: "blend",
    wyrabianie: "knead",
    "gotowanie na parze": "steam",
    ważenie: "weigh", wazenie: "weigh",
    heat: "warm", reheat: "warm", podgrzewanie: "warm",
    wait: "rest", cool: "rest", proof: "rest", odpoczynek: "rest",
};

function toAction(raw?: string): ActionType {
    const key = (raw ?? "").trim().toLowerCase();
    if (ACTIONS.includes(key as ActionType)) return key as ActionType;
    return ACTION_SYNONYMS[key] ?? "mix";
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}

/**
 * Map an AI-generated recipe into the API's RecipeInput, forced to private.
 * Sanitizes every step so it passes the backend's strict validation
 * (action enum, integer ranges, non-empty ingredient/description steps).
 */
function toRecipeInput(recipe: GeneratedRecipe): RecipeInput {
    const steps: Step[] = [];
    let order = 1;

    for (const s of recipe.steps ?? []) {
        if (s.type === "action") {
            steps.push({
                type: "action",
                order: order++,
                action: toAction(s.action),
                temperatureC: clampInt(s.temperatureC, 0, 200, 0),
                bladeSpeed: clampInt(s.bladeSpeed, 0, 10, 0),
                durationSeconds: clampInt(s.durationSeconds, 1, 86400, 30),
            });
        } else if (s.type === "ingredient") {
            const items = (s.items ?? [])
                .map((it: any) => ({
                    name: typeof it?.name === "string" ? it.name.trim() : "",
                    quantity:
                        typeof it?.quantity === "number" && it.quantity >= 0
                            ? it.quantity
                            : 0,
                    unit: (UNITS.includes(it?.unit) ? it.unit : "g") as Unit,
                    custom: !!it?.custom,
                }))
                .filter((it) => it.name); // backend requires a non-empty name
            if (items.length === 0) continue; // backend rejects empty ingredient steps
            steps.push({ type: "ingredient", order: order++, items });
        } else {
            const description =
                typeof s.description === "string" ? s.description.trim() : "";
            if (!description) continue; // backend requires a non-empty description
            steps.push({ type: "description", order: order++, description });
        }
    }

    const ingredients = steps
        .filter((s) => s.type === "ingredient")
        .flatMap((s) => s.items ?? [])
        .map((it) => ({
            name: it.name ?? "",
            quantity: it.quantity ?? 0,
            unit: (it.unit ?? "g") as Unit,
            custom: !!it.custom,
        }));

    return {
        name: recipe.name,
        description: recipe.description,
        category: recipe.category || "Inne",
        image: "",
        difficulty: recipe.difficulty,
        estimatedTimeSeconds: clampInt(recipe.estimatedTimeSeconds, 0, 86400, 0),
        portions: clampInt(recipe.portions, 1, 999, 1),
        isPublic: false,
        ingredients,
        steps,
    };
}

export default function ChatBot() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    // Asystent AI is only available to logged-in users.
    useEffect(() => {
        if (!authLoading && !user) navigate("/login");
    }, [authLoading, user, navigate]);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Cześć! Jestem Twoim inteligentnym asystentem kuchennym DreamFoodX. Napisz mi, co masz w lodówce lub co chcesz ugotować, a stworzę dla Ciebie idealny przepis!",
            sender: "bot",
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);

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
            const response = await fetch(`${AI_URL}/chat/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: userText }),
            });

            if (!response.ok) throw new Error("Błąd odpowiedzi serwera AI");

            const recipeData: GeneratedRecipe = await response.json();

            if (!recipeData || !recipeData.name) {
                throw new Error("Zwrócony przepis ma nieprawidłową strukturę danych.");
            }

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    text: `Stworzyłem przepis na: **${recipeData.name}**! \n\n${recipeData.description}\n\nLiczba kroków: ${recipeData.steps ? recipeData.steps.length : 0}.`,
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

    const saveRecipe = async (msg: Message) => {
        if (!msg.recipeData || savingId !== null) return;

        if (!user) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    text: "Aby zapisać przepis w „Moje Przepisy”, musisz się najpierw zalogować. Przekierowuję do logowania…",
                    sender: "bot",
                },
            ]);
            setTimeout(() => navigate("/login"), 1200);
            return;
        }

        setSavingId(msg.id);
        try {
            const saved = await recipeApi.create(toRecipeInput(msg.recipeData));
            setMessages((prev) =>
                prev.map((m) => (m.id === msg.id ? { ...m, savedId: saved._id } : m)),
            );
        } catch (error) {
            const text =
                error instanceof ApiError
                    ? error.message
                    : "Nie udało się zapisać przepisu. Spróbuj ponownie.";
            setMessages((prev) => [
                ...prev,
                { id: Date.now(), text: `❌ ${text}`, sender: "bot" },
            ]);
        } finally {
            setSavingId(null);
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
                                {msg.recipeData &&
                                    (msg.savedId ? (
                                        <button
                                            className="save-recipe-btn saved"
                                            onClick={() => navigate(`/przepis/${msg.savedId}`)}
                                        >
                                            ✓ Zapisano w „Moje Przepisy” — zobacz przepis
                                        </button>
                                    ) : (
                                        <button
                                            className="save-recipe-btn"
                                            disabled={savingId === msg.id}
                                            onClick={() => saveRecipe(msg)}
                                        >
                                            {savingId === msg.id
                                                ? "Zapisywanie…"
                                                : "💾 Zapisz w „Moje Przepisy” (prywatny)"}
                                        </button>
                                    ))}
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
