import os
import json
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest").strip()

app = FastAPI(title="DreamFoodX Gemini AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    prompt: str

class AiGenerateInput(BaseModel):
    ingredients: List[str]
    dishName: Optional[str] = None
    language: Optional[str] = "pl"


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service-gemini", "configured": bool(GEMINI_API_KEY)}


@app.post("/chat/generate")
async def generate_recipe(req: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

    flat_prompt = (
        "Jesteś genialnym Szefem Kuchni dla robota kuchennego DreamFoodX.\n"
        "ZWROT MA BYĆ WYŁĄCZNIE CZYSTYM TEKSTEM JSON. Nie dodawaj ```json, nie dodawaj ``` na końcu, nie pisz żadnych wstępów!\n"
        "Wszystkie teksty w polach muszą być w języku polskim.\n\n"
        "Wygeneruj przepis jako obiekt JSON o dokładnie takiej strukturze:\n"
        "{\n"
        "  \"name\": \"Nazwa dania po polsku\",\n"
        "  \"description\": \"Krótki, apetyczny opis po polsku\",\n"
        "  \"category\": \"Obiad\",\n"
        "  \"difficulty\": \"medium\",\n"
        "  \"estimatedTimeSeconds\": 1800,\n"
        "  \"portions\": 4,\n"
        "  \"isPublic\": false,\n"
        "  \"steps\": [\n"
        "    {\n"
        "      \"type\": \"action\",\n"
        "      \"action\": \"mix\",\n"
        "      \"temperatureC\": 0,\n"
        "      \"bladeSpeed\": 3,\n"
        "      \"durationSeconds\": 30,\n"
        "      \"description\": \"Miksowanie składników w misie.\",\n"
        "      \"items\": []\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
        "ŚCISŁE ZASADY (inaczej przepis zostanie odrzucony):\n"
        "- Pole \"difficulty\" MUSI być jedną z: easy, medium, hard.\n"
        "- Dla kroku typu \"action\" pole \"action\" MUSI być DOKŁADNIE jedną z (po angielsku): "
        "mix, cook, fry, chop, blend, knead, steam, weigh, warm, rest. Nie używaj innych słów (np. boil, bake, saute).\n"
        "- W krokach \"action\": temperatureC to liczba całkowita 0-160, bladeSpeed to liczba całkowita 0-10, "
        "durationSeconds to dodatnia liczba całkowita (w sekundach).\n"
        "- Krok typu \"ingredient\" musi mieć niepustą tablicę \"items\"; każdy element ma: "
        "\"name\" (tekst), \"quantity\" (liczba), \"unit\" (jedna z: g, kg, ml, l, tsp, tbsp, cup, pcs).\n"
        "- Krok typu \"description\" musi mieć niepuste pole \"description\".\n"
        "- Dodaj kroki typu \"ingredient\" z realnymi składnikami i ilościami, a nie tylko opisy.\n\n"
        f"Użytkownik prosi o przepis na podstawie: {req.prompt}"
    )

    payload = {
        "contents": [{
            "parts": [{"text": flat_prompt}]
        }]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=30.0)

            if response.status_code != 200:
                print(f"[GEMINI ERROR]: {response.text}")
                raise HTTPException(status_code=response.status_code, detail=response.text)

            data = response.json()
            raw_text = data['candidates'][0]['content']['parts'][0]['text'].strip()
            start_idx = raw_text.find('{')
            end_idx = raw_text.rfind('}')

            if start_idx == -1 or end_idx == -1:
                raise ValueError("Model nie zwrócił prawidłowego obiektu JSON.")

            clean_json = raw_text[start_idx:end_idx + 1]
            return JSONResponse(content=json.loads(clean_json))

        except Exception as e:
            print(f"\n[CRITICAL ERROR]: {str(e)}\n")
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate")
async def generate_description_endpoint(req: AiGenerateInput):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    ingredients_str = ", ".join(req.ingredients)
    dish_info = f" dla dania '{req.dishName}'" if req.dishName else ""

    prompt = (
        f"Wygeneruj apetyczny, profesjonalny opis potrawy po polsku{dish_info} "
        f"na podstawie następujących składników: {ingredients_str}. "
        f"Opis powinien mieć maksymalnie 3-4 zdania."
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=30.0)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.text)

            data = response.json()
            text_result = data['candidates'][0]['content']['parts'][0]['text'].strip()
            return JSONResponse(content={"description": text_result})
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return None