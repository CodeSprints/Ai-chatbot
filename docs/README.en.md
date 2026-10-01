# Iskra: documentation

## Purpose

Iskra is one AI assistant interface for the browser, mobile devices, and desktop. The frontend uses Vue 3, TypeScript, Tailwind CSS, and Vite. Tauri 2 wraps the same web build as a native application.

## Getting started

Node.js 20 or newer is required. Desktop builds also require Rust, Cargo, and the Tauri system dependencies listed in the official guide.

```bash
npm install
npm run dev
```

The app is available at `http://localhost:5173`. Use `npm run build` for a production build and `npm run preview` to inspect it.

## Tauri

```bash
npm run tauri dev
npm run tauri build
```

`src-tauri/tauri.conf.json` defines the window size, product identifier, CSP, and build artifacts for desktop and mobile platforms. View code does not branch by platform. Add system capabilities through Tauri plugins and isolate them in dedicated modules.

## API connection

The app starts in demo mode so the interface works without an API key. Set `VITE_CHAT_API_URL` to make the frontend send a POST request containing:

```json
{"messages":[{"id":"...","role":"user","content":"...","createdAt":0}]}
```

The API must return JSON with either a `message` or `content` field. AI provider keys must stay on the server. Never put secrets in `VITE_*` variables or in the Tauri application.

## Data and privacy

Conversation history is stored in the device `localStorage`. Deleting a conversation removes it from local history. Before using sensitive data, implement encrypted storage and a retention policy appropriate for the product.

## Accessibility

The interface uses semantic regions, form labels, accessible icon names, an `aria-live` message area, visible focus, sufficient color contrast, and keyboard support. The layout works from 320 px and respects `prefers-reduced-motion`. Before release, run audits with NVDA or VoiceOver, Lighthouse, and axe-core.

## Tests and quality

```bash
npm test
npm run lint
npm run build
```

Vitest tests cover local storage and the API client contract. Component tests can be extended with Vue Test Utils. End-to-end coverage should include creating a conversation, sending a message, stopping a response, deleting a conversation, keyboard navigation, and the mobile layout.

## Structure

- `src/App.vue`: application composition.
- `src/components`: history and chat panels.
- `src/composables/useChat.ts`: conversation state and request lifecycle.
- `src/lib`: persistence and API client.
- `src/types`: TypeScript contracts.
- `src-tauri`: native shell.
- `tests`: unit tests.
