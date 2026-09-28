# Vue + Tauri Template

## Wymagania
- Node.js 20.19+ lub 22.12+, npm 10+
- Rust stable
- zależności systemowe Tauri: https://v2.tauri.app/start/prerequisites/

## Desktop
```bash
npm install
npm run desktop:dev
npm run desktop:build
```

## Android
Zainstaluj Android Studio, SDK/NDK i ustaw wymagane zmienne zgodnie z dokumentacją Tauri. Następnie:
```bash
npm run android:init
npm run android:dev
npm run android:build
```

## iOS (tylko macOS)
Wymaga Xcode i CocoaPods:
```bash
npm run ios:init
npm run ios:dev
npm run ios:build
```

## Przed rozpoczęciem
1. Zmień `name` w `package.json`.
2. Zmień `productName` i unikalny `identifier` w `src-tauri/tauri.conf.json`.
3. Zmień nazwę pakietu i biblioteki w `src-tauri/Cargo.toml` oraz wywołanie w `src-tauri/src/main.rs`.
4. Podmień `app-icon.svg`, potem uruchom `npx tauri icon app-icon.svg`.
5. Ograniczaj uprawnienia w `src-tauri/capabilities` i ustaw CSP przed produkcją, gdy znasz wymagane źródła.

## Kontrola jakości
```bash
npm run typecheck && npm run lint && npm test && npm run build
```
