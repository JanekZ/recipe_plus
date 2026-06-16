"""
Nie działa, do zmiany modelu
"""

import json
import os
from typing import Optional

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

app = FastAPI(title="DreamFoodX AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    ingredients: list[str] = Field(default_factory=list)
    dishName: Optional[str] = None
    language: str = "pl"


class GenerateResponse(BaseModel):
    description: str
    source: str  # "openai" | "fallback"


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ai-service",
        "llm": "openai" if OPENAI_API_KEY else "fallback",
    }


def _build_prompt(req: GenerateRequest) -> str:
    dish = req.dishName or "potrawa"
    ingredients = ", ".join(i for i in req.ingredients if i.strip()) or "podane składniki"
    return (
        f"Jesteś szefem kuchni piszącym dla aplikacji z przepisami na urządzenie "
        f"DreamFoodX. Język odpowiedzi: {req.language}. "
        f"Na podstawie nazwy dania \"{dish}\" i składników ({ingredients}) napisz "
        f"zachęcający opis dania (2-3 zdania). "
        f"Zwróć WYŁĄCZNIE poprawny JSON o kształcie "
        f'{{"description": "..."}} bez dodatkowego tekstu.'
    )


async def _generate_with_openai(req: GenerateRequest) -> Optional[GenerateResponse]:
    """Return a response from OpenAI, or None on any failure (caller falls back)."""
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": "You write concise culinary copy and always reply with valid JSON."},
            {"role": "user", "content": _build_prompt(req)},
        ],
        "temperature": 0.8,
        "response_format": {"type": "json_object"},
    }
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(OPENAI_URL, headers=headers, json=payload)
            res.raise_for_status()
            content = res.json()["choices"][0]["message"]["content"]
            data = json.loads(content)
            description = str(data.get("description", "")).strip()
            if not description:
                return None
            return GenerateResponse(description=description, source="openai")
    except Exception as exc:
        print(f"[ai] openai call failed, using fallback: {exc}")
        return None


def _generate_fallback(req: GenerateRequest) -> GenerateResponse:
    dish = req.dishName or "To danie"
    items = [i.strip() for i in req.ingredients if i.strip()]
    if items:
        listed = ", ".join(items[:-1]) + (f" i {items[-1]}" if len(items) > 1 else items[0])
        description = (
            f"{dish} łączy w sobie {listed}, tworząc aromatyczną kompozycję smaków. "
            f"Przygotujesz je bez wysiłku dzięki precyzyjnej kontroli temperatury i "
            f"prędkości ostrzy urządzenia DreamFoodX."
        )
    else:
        description = (
            f"{dish} to prosty przepis przygotowany od początku do końca w urządzeniu DreamFoodX."
        )

    return GenerateResponse(description=description, source="fallback")


@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest) -> GenerateResponse:
    if OPENAI_API_KEY:
        result = await _generate_with_openai(req)
        if result is not None:
            return result
    return _generate_fallback(req)
