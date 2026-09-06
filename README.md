# Recipe+ (DreamFoodX)

Aplikacja webowa do tworzenia, przeglądania i udostępniania przepisów kulinarnych
przygotowanych pod robota kuchennego **DreamFoodX**.

Całość działa jako zestaw usług uruchamianych przez Docker Compose.
Instrukcja uruchomienia znajduje się w pliku [INSTALL.md](INSTALL.md).

---

## Spis treści

- [Funkcje](#funkcje)
- [Architektura](#architektura)
- [Stos technologiczny](#stos-technologiczny)
- [Struktura repozytorium](#struktura-repozytorium)
- [Model danych](#model-danych)
- [Format wymiany DreamFoodX](#format-wymiany-dreamfoodx)
- [API](#api)
- [Zmienne środowiskowe](#zmienne-środowiskowe)
- [Ścieżki w interfejsie](#ścieżki-w-interfejsie)

---

## Funkcje

**Konta użytkowników**

- Rejestracja (e-mail, hasło min. 8 znaków, imię, nazwisko, pseudonim) i logowanie.
- Sesja oparta na tokenie JWT (ważnym 7 dni), przechowywanym w `localStorage`.
- Zmiana hasła oraz usunięcie konta wraz ze wszystkimi własnymi przepisami i produktami.

**Przepisy**

- Edytor z krokami trzech typów:
  - **składnikowy** - lista produktów z ilością i jednostką,
  - **akcyjny** - czynność robota wraz z temperaturą, prędkością ostrzy i czasem,
  - **opisowy** - swobodny tekst.
- Zmiana kolejności kroków metodą przeciągnij i upuść.
- Metadane: kategoria, trudność, czas przygotowania, liczba porcji, zdjęcie.
- Widoczność publiczna albo prywatna, publiczne przepisy trafiają do wyszukiwarki.
- Import i eksport pojedynczego przepisu do pliku JSON w formacie DreamFoodX.

**Wyszukiwanie**

- Przeglądanie przepisów publicznych z filtrowaniem po nazwie, kategorii, autorze
  i składniku.

**Produkty**

- Wbudowany katalog 22 produktów globalnych (warzywa, nabiał, mięso, przyprawy,
  produkty sypkie), zasiewany automatycznie przy starcie usługi przepisów.
- Własne produkty użytkownika, widoczne wyłącznie dla niego.

**Asystent AI** (wymagany klucz Gemini)

- Generowanie kompletnego przepisu z opisu w języku naturalnym i zapisanie go
  jednym kliknięciem do „Moich przepisów”.
- Generowanie apetycznego opisu dania na podstawie listy składników, bezpośrednio
  w edytorze przepisu.

---

## Architektura

Cztery usługi aplikacyjne plus dwie bazy danych, spięte siecią `recipe-network`:

| Usługa | Rola | Port hosta | Technologia |
|---|---|---|---|
| `frontend` | interfejs użytkownika (SPA) | `5173` | React 19 + Vite |
| `backend` | przepisy i produkty | `3001` | Express + Mongoose |
| `auth-service` | konta i tokeny JWT | `3002` | Express + `pg` + bcrypt |
| `ai-service` | integracja z Google Gemini | `8000` | FastAPI + httpx |
| `postgres` | użytkownicy | `5432` | PostgreSQL 16 |
| `mongo` | przepisy i produkty | `27017` | MongoDB 7 |

Przepływ żądań:

```
przeglądarka
   ├─→ auth-service :3002      rejestracja, logowanie, konto
   ├─→ backend      :3001      przepisy, produkty - ai-service :8000  (opis dania)
   └─→ ai-service   :8000      asystent AI (generowanie przepisu)
```
---

## Stos technologiczny

**Frontend** - React 19, React Router 7, TypeScript, Vite 8, czysty CSS
(bez frameworka UI).

**Backend przepisów** - Node 22, Express 4, Mongoose 8, `jsonwebtoken`,
Ajv 8 (walidacja plików DreamFoodX wg JSON Schema 2020-12).

**Usługa kont** - Node 22, Express 4, `pg`, `bcryptjs` (10 rund soli),
`jsonwebtoken`.

**Usługa AI** - Python, FastAPI, Uvicorn, httpx; model `gemini-flash-latest`
przez Google Generative Language API.

**Infrastruktura** - Docker Compose, PostgreSQL 16 Alpine, MongoDB 7.

---

## Struktura repozytorium

```
recipe_plus/
├── docker-compose.yml        definicja wszystkich usług
├── Dockerfile                obraz frontendu (serwer deweloperski Vite)
├── .env                      sekrety - w repozytorium (pusty szablon)
│
├── src/                      frontend
│   ├── api/                  klient HTTP, adresy usług, typy współdzielone
│   ├── components/           komponenty i widoki (każdy z własnym plikiem CSS)
│   ├── context/              AuthContext - stan zalogowanego użytkownika
│   └── utils/                skalowanie obrazów, formatowanie czasu
│
├── backend/                  usługa przepisów i produktów
│   └── src/
│       ├── models/           schematy Mongoose (Recipe, Product)
│       ├── routes/           /recipes, /products
│       ├── dreamfoodx.ts     schemat JSON oraz konwersja w obie strony
│       ├── aiClient.ts       wywołanie ai-service
│       ├── jwt.ts            middleware requireAuth / optionalAuth
│       └── seed.ts           produkty globalne
│
├── auth-service/             usługa kont
│   └── src/                  index.ts (endpointy), db.ts, jwt.ts
│
├── ai-service/               usługa AI
│   ├── main.py               endpointy FastAPI i prompty
│   └── requirements.txt
│
└── postgres/
    └── init.sql              tabela users, indeksy, trigger updated_at
```

---

## Model danych

### Użytkownik (PostgreSQL, tabela `users`)

`id` (UUID), `email`, `password_hash`, `name`, `last_name`, `nickname`,
`created_at`, `updated_at`. Unikalność e-maila i pseudonimu wymuszają indeksy
na wartościach zapisanych małymi literami.

### Przepis (MongoDB, kolekcja `recipes`)

| Pole | Opis |
|---|---|
| `name` | nazwa dania (indeks tekstowy) |
| `description` | opis, opcjonalnie wygenerowany przez AI |
| `category` | domyślnie `Inne` |
| `image` | data URL zdjęcia |
| `difficulty` | `easy`, `medium`, `hard` |
| `estimatedTimeSeconds`, `portions` | czas i liczba porcji |
| `authorId`, `authorName` | autor (`authorId` to `sub` z tokenu JWT) |
| `isPublic` | widoczność w wyszukiwarce |
| `ingredients` | spłaszczona lista składników, wyliczana z kroków przy zapisie |
| `steps` | uporządkowana lista kroków |

### Krok

Każdy krok ma `type` i `order` (numerowany od 1, nadawany przez serwer przy zapisie).

- **`ingredient`** - niepusta tablica `items`; każdy element ma `name`, `quantity`,
  `unit` oraz opcjonalne `productId` i `custom`.
- **`action`** - `action` (jedna z czynności poniżej), `temperatureC` (0–200),
  `bladeSpeed` (0–10), `durationSeconds` (1–86400).
- **`description`** - niepuste pole `description`.

### Produkt (MongoDB, kolekcja `products`)

`name`, `category`, `scope` (`global` albo `user`), `ownerId`. Produkty globalne
widzi każdy, produkty użytkownika tylko ich właściciel. Unikalność pary
(`ownerId`, `name`) obowiązuje wyłącznie dla produktów użytkownika.

---

## Format wymiany DreamFoodX

Przepis eksportuje się do samodzielnego pliku JSON w kopercie:

```json
{
  "format": "dreamfoodx.recipe",
  "formatVersion": "1.0",
  "exportedAt": "2026-09-06T12:00:00.000Z",
  "recipe": { "name": "...", "difficulty": "medium", "steps": [] }
}
```

Plik przy imporcie jest walidowany schematem JSON Schema 2020-12 (Ajv), błędny plik zwraca listę konkretnych niezgodności.
Przepisy zaimportowane przez API zawsze powstają jako **prywatne**, niezależnie od
zawartości pliku, a autorem zostaje osoba importująca.

Import i eksport są dostępne w edytorze przepisu (przyciski **Importuj JSON**
i **Eksportuj JSON**) oraz na stronie przepisu (**Eksportuj do DreamFoodX**,
obsługiwane przez serwer).

---

## API

Wszystkie usługi mają otwarty CORS i endpoint `GET /health`.
Uwierzytelnienie: nagłówek `Authorization: Bearer <token>`.

### auth-service - `http://localhost:3002`

| Metoda | Ścieżka | Dostęp | Opis |
|---|---|--------|---|
| `POST` | `/auth/register` | -      | rejestracja; zwraca token i użytkownika |
| `POST` | `/auth/login` | -      | logowanie |
| `GET` | `/auth/me` | token  | dane zalogowanego użytkownika |
| `PUT` | `/auth/password` | token  | zmiana hasła |
| `DELETE` | `/auth/account` | token  | usunięcie konta |
| `POST` | `/auth/verify` | -      | weryfikacja tokenu (na potrzeby usług) |

### backend - `http://localhost:3001`

| Metoda | Ścieżka | Dostęp     | Opis |
|---|---|------------|---|
| `GET` | `/recipes` | -          | przepisy publiczne; filtry `q`, `category`, `author`, `ingredient` |
| `GET` | `/recipes/mine` | token      | przepisy zalogowanego użytkownika |
| `DELETE` | `/recipes/mine` | token      | usunięcie wszystkich swoich przepisów |
| `POST` | `/recipes` | token      | utworzenie przepisu |
| `GET` | `/recipes/:id` | opcjonalny | szczegóły; prywatny widzi tylko autor |
| `PUT` | `/recipes/:id` | token      | edycja (tylko autor) |
| `DELETE` | `/recipes/:id` | token      | usunięcie (tylko autor) |
| `GET` | `/recipes/:id/export` | opcjonalny | plik `.dreamfoodx.json` |
| `POST` | `/recipes/import` | token      | import pliku DreamFoodX |
| `POST` | `/recipes/ai/describe` | token      | opis dania z listy składników |
| `GET` | `/products` | opcjonalny | produkty globalne i własne; filtry `category`, `q` |
| `GET` | `/products/categories` | opcjonalny | lista kategorii |
| `POST` | `/products` | token      | dodanie własnego produktu |
| `DELETE` | `/products/mine` | token      | usunięcie wszystkich swoich produktów |
| `DELETE` | `/products/:id` | token      | usunięcie własnego produktu |

### ai-service - `http://localhost:8000`

| Metoda | Ścieżka | Opis |
|---|---|---|
| `POST` | `/chat/generate` | pełny przepis z opisu w języku naturalnym |
| `POST` | `/generate` | opis dania na podstawie składników |

Bez ustawionego `GEMINI_API_KEY` oba endpointy zwracają `500`. Reszta aplikacji
działa wtedy normalnie, tylko bez funkcji AI. Model wymusza w promptcie strukturę
odpowiedzi, a wygenerowany przepis i tak przechodzi pełną walidację po stronie
`backend`.

---

## Zmienne środowiskowe

Plik `.env` w katalogu głównym — czyta go Docker Compose:

| Zmienna | Opis |
|---|---|
| `JWT_SECRET` | sekret podpisujący tokeny; wspólny dla `backend` i `auth-service` |
| `GEMINI_API_KEY` | klucz Google Gemini |

Pozostałe wartości są zapisane wprost w `docker-compose.yml`, bo dotyczą wyłącznie
środowiska deweloperskiego:

- `POSTGRES_URL` — użytkownik `recipe_user`, hasło `recipe_pass`, baza `recipe_db`,
- `MONGO_URL` — `mongodb://mongo:27017/recipe_ingredients`,
- `JWT_EXPIRES_IN` — `7d`,
- `AI_SERVICE_URL` — `http://ai-service:8000`,
- `VITE_API_URL`, `VITE_AUTH_URL`, `VITE_AI_URL` — adresy usług dla przeglądarki.

---

## Ścieżki w interfejsie

| Ścieżka | Widok |
|---|---|
| `/` | przeglądanie przepisów publicznych z filtrami |
| `/login` | logowanie i rejestracja |
| `/konto` | dane konta, zmiana hasła, usunięcie konta |
| `/moje-przepisy` | własne przepisy (wszystkie / publiczne / prywatne) |
| `/moje-produkty` | katalog produktów |
| `/nowy-przepis` | edytor nowego przepisu |
| `/edytuj-przepis/:id` | edycja istniejącego przepisu |
| `/przepis/:id` | strona przepisu z eksportem |
| `/asystent-ai` | czat generujący przepisy |
