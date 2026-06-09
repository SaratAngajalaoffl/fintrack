## Tech stack

- **Framework:** Next.js (App Router), React, TypeScript.
- **API:** Go service in **`api/`** — app HTTP lives here (auth, bank accounts, credit cards, expense categories, fund buckets). Use **`getApiRoute()`** for endpoint resolution. There are **no** Next Route Handlers under **`web/src/app/api/`** for these domains; see [Go API + Next.js](api-architecture.md).
- **Styling:** Tailwind CSS v4. Theme tokens live in `web/src/app/globals.css` (`@import "tailwindcss"` + `@theme inline`). **Catppuccin Mocha** is the app palette: **red** (`#f38ba8`) as `primary`, **mauve** (`#cba6f7`) as `secondary`. Named Mocha colors are exposed as Tailwind colors: `text-text`, `text-subtext-1`, `text-subtext-0`, `bg-overlay-*`, `bg-surface-*`, `bg-base`, `bg-mantle`, `bg-crust`, etc. Prefer semantic roles where they fit: `bg-background`, `text-foreground`, `text-primary`, `bg-secondary`, `border-border`.
- **Client data layer:** `@tanstack/react-query` powers browser-side API calls (mutations/queries) behind a small `ReactQueryProvider` client boundary in root layout. Keep routes and non-interactive UI as Server Components.
- **Fonts:** **Montserrat** via `next/font/google` in `web/src/app/layout.tsx` (`--font-montserrat`), applied to both `--font-sans` and `--font-mono` in `@theme inline` so UI and numeric lines share one family.
- **Database:** PostgreSQL. SQL migrations live in **`api/migrations/`**. The **Go API** (`api/cmd/api`) applies them **on startup** (same **`schema_migrations`** filenames as before). Docker Compose starts **`postgres` → `api` → `web`** (or **`test`**). Seeding is **not** part of the API (use your own scripts / `data/`).

## Next.js version note

This project may use a newer Next.js than older training data. Prefer **local** sources: **`web/node_modules/next`** types, **`web/next.config.ts`**, and official docs for the installed version. If something looks deprecated, verify before relying on it.
