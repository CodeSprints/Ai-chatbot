# Vue + Tauri Template

## Requirements

* Node.js 20.19+ or 22.12+, npm 10+
* Rust stable
* Tauri system dependencies: https://v2.tauri.app/start/prerequisites/

## Desktop

```bash
npm install
npm run desktop:dev
npm run desktop:build
```

## Android

Install Android Studio, the required SDK/NDK, and configure the required environment variables according to the Tauri documentation. Then:

```bash
npm run android:init
npm run android:dev
npm run android:build
```

## iOS (macOS only)

Requires Xcode and CocoaPods:

```bash
npm run ios:init
npm run ios:dev
npm run ios:build
```

## Before Getting Started

1. Change the `name` in `package.json`.
2. Change `productName` and the unique `identifier` in `src-tauri/tauri.conf.json`.
3. Change the package and library name in `src-tauri/Cargo.toml` and the corresponding invocation in `src-tauri/src/main.rs`.
4. Replace `app-icon.svg`, then run `npx tauri icon app-icon.svg`.
5. Limit permissions in `src-tauri/capabilities` and configure the CSP before production once you know which sources are required.

## Quality Checks

```bash
npm run typecheck && npm run lint && npm test && npm run build
```
