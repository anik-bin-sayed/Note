# React + Vite

## Encrypted Note Vault

On first sign-in, create a PIN or passphrase with at least 8 characters. The browser derives an AES-256 key using PBKDF2-HMAC-SHA-256 (600,000 iterations and a per-account random salt), then encrypts each note with AES-GCM and a fresh 96-bit IV. The PIN and derived key are never sent to the API or saved in browser storage; the key remains in memory until the page is closed or the user logs out.

The API stores encrypted note payloads, IVs, vault salt/KDF metadata, and an encrypted verifier. Account ownership and note timestamps remain visible to the server. Note content search runs locally after unlock, so the server cannot search encrypted notes. A forgotten PIN cannot be reset and encrypted notes cannot be recovered without it. Use a strong passphrase, and serve the app over HTTPS outside local development.

Entries created before this vault was enabled use the previous server-side encryption format. After unlock, the browser migrates those entries to client-side encryption; until migration completes, legacy entries are still readable by the authenticated API.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
