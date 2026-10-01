# Iskra: dokumentacja

## Cel

Iskra to jeden interfejs asystenta AI dla przeglądarki, urządzeń mobilnych i aplikacji desktopowej. Frontend korzysta z Vue 3, TypeScript, Tailwind CSS i Vite. Tauri 2 opakowuje ten sam build webowy jako aplikację natywną.

## Uruchomienie

Wymagany jest Node.js 20 lub nowszy. Dla desktopu potrzebne są Rust, Cargo oraz zależności Tauri opisane w oficjalnym przewodniku.

```bash
npm install
npm run dev
```

Aplikacja działa pod `http://localhost:5173`. Komenda produkcyjna to `npm run build`, a podgląd buildu to `npm run preview`.

## Tauri

```bash
npm run tauri dev
npm run tauri build
```

`src-tauri/tauri.conf.json` definiuje rozmiar okna, identyfikator produktu, politykę CSP i artefakty dla systemów desktopowych oraz mobilnych. Kod widoków nie rozróżnia platform. Funkcje systemowe należy dodawać przez pluginy Tauri i izolować w osobnych modułach.

## Połączenie z API

Domyślnie aplikacja działa w trybie demonstracyjnym, aby interfejs był użyteczny bez klucza API. Po ustawieniu `VITE_CHAT_API_URL` frontend wysyła żądanie POST z obiektem:

```json
{"messages":[{"id":"...","role":"user","content":"...","createdAt":0}]}
```

API powinno zwrócić JSON z polem `message` albo `content`. Klucze dostawców AI muszą pozostać po stronie serwera. Nie należy umieszczać sekretów w `VITE_*` ani w aplikacji Tauri.

## Dane i prywatność

Historia jest przechowywana w `localStorage` urządzenia. Usunięcie rozmowy usuwa ją z lokalnej historii. Przed użyciem z danymi wrażliwymi należy wdrożyć szyfrowany magazyn oraz politykę retencji dopasowaną do produktu.

## Dostępność

Interfejs używa semantycznych regionów, etykiet formularzy, nazw dla ikon, komunikatu `aria-live`, widocznego fokusu, kontrastu kolorów i obsługi klawiatury. Układ działa od 320 px. Szanuje `prefers-reduced-motion`. Przed wydaniem należy wykonać audyt z NVDA lub VoiceOver, Lighthouse i axe-core.

## Testy i jakość

```bash
npm test
npm run lint
npm run build
```

Testy Vitest sprawdzają magazyn lokalny i kontrakt klienta API. Testy komponentowe można rozszerzyć o Vue Test Utils. Testy end-to-end powinny pokrywać: utworzenie rozmowy, wysłanie wiadomości, przerwanie odpowiedzi, usunięcie rozmowy, klawiaturę i widok mobilny.

## Struktura

- `src/App.vue`: kompozycja aplikacji.
- `src/components`: panel historii i panel rozmowy.
- `src/composables/useChat.ts`: stan rozmów i cykl żądania.
- `src/lib`: trwałość danych i klient API.
- `src/types`: kontrakty TypeScript.
- `src-tauri`: powłoka natywna.
- `tests`: testy jednostkowe.
