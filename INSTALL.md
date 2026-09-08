# Instalacja i uruchomienie

Projekt jest **w całości oparty na Dockerze**, nie trzeba instalować lokalnie
Node.js, Pythona, PostgreSQL ani MongoDB. Wszystkie zależności żyją w kontenerach.

---

## Spis treści

- [1. Wymagania wstępne](#1-wymagania-wstępne)
- [2. Konfiguracja pliku .env](#2-konfiguracja-pliku-env)
- [3. Uruchomienie](#3-uruchomienie)
- [4. Reset baz danych](#4-reset-baz-danych)
- [5. Zatrzymanie i usunięcie](#5-zatrzymanie-i-usunięcie)

---

## 1. Wymagania wstępne

| Narzędzie | Wersja | Uwagi |
|---|---|---|
| Docker Engine | 20.10 lub nowszy | na Windows i macOS: Docker Desktop |
| Docker Compose | v2 (`docker compose`, bez łącznika) | wchodzi w skład Docker Desktop |



**Wymagane wolne porty na hoście:** `5173`, `3001`, `3002`, `8000`, `5432`, `27017`.

**Miejsce na dysku:** około 3 GB na obrazy (Node 22 Alpine, Python, PostgreSQL 16,
MongoDB 7) plus wolumeny z danymi.

**Klucz Google Gemini** - potrzebny wyłącznie do funkcji AI. Bez niego aplikacja
uruchomi się i będzie w pełni użyteczna, tylko asystent AI i generowanie opisów
zwrócą błąd. Klucz można wygenerować w Google AI Studio.

---

## 2. Konfiguracja pliku .env

Plik `.env` znajduje się już w katalogu głównym projektu - repozytorium zawiera go
jako **szablon z pustymi wartościami**. Trzeba go wypełnić.

Docelowa zawartość:

```dotenv
JWT_SECRET=wstaw-tutaj-dlugi-losowy-ciag
GEMINI_API_KEY=wstaw-tutaj-klucz-gemini
```

---

## 3. Uruchomienie

```bash
docker compose up --build
```

Pierwsze uruchomienie trwa kilka minut - Docker pobiera obrazy bazowe i instaluje
zależności każdej usługi. Kolejne starty (`docker compose up`, bez `--build`)
są już szybkie.

Kolejność startu jest wymuszona w `docker-compose.yml`: `postgres` i `mongo`
muszą przejść własne testy stanu (`healthcheck`), zanim ruszą usługi zależne.
Komunikaty w rodzaju „waiting for database” w pierwszych sekundach są normalne.

Aplikacja czeka pod adresem:

```
http://localhost:5173/
```

---

## 4. Reset baz danych

Dane trwają w wolumenach `postgres-data` i `mongo-data`, więc przeżywają
`docker compose down`. Aby je wyczyścić, trzeba usunąć wolumeny:

```bash
docker compose down -v
```

```bash
docker compose up --build
```

---

## 5. Zatrzymanie i usunięcie

Zatrzymanie z zachowaniem danych:

```bash
docker compose down
```

Zatrzymanie wraz z usunięciem danych:

```bash
docker compose down -v
```

Pełne sprzątanie, łącznie z obrazami zbudowanymi dla projektu:

```bash
docker compose down -v --rmi local
```