# Fintrack — agent guide

<!-- BEGIN:nextjs-agent-rules -->

This project uses a current Next.js release; APIs and conventions may differ from older training data. Prefer `node_modules/next` types and docs for the installed version.

<!-- END:nextjs-agent-rules -->

This document orients coding agents and contributors to how Fintrack is organized, built, and styled. Read it before adding features or restructuring the repo.

## Product

**Fintrack** is a responsive personal finance web app (Next.js). Core domains will include accounts, transactions, categories, and reporting — implement incrementally; keep changes scoped to the task.

## Tech stack

- **Framework:** Next.js (App Router), React, TypeScript.
- **Styling:** Tailwind CSS v4. Theme tokens live in `src/app/globals.css` (`@import "tailwindcss"` + `@theme inline`). **Catppuccin Mocha** is the app palette: **red** (`#f38ba8`) as `primary`, **mauve** (`#cba6f7`) as `secondary`. Named Mocha colors are exposed as Tailwind colors: `text-text`, `text-subtext-1`, `text-subtext-0`, `bg-overlay-*`, `bg-surface-*`, `bg-base`, `bg-mantle`, `bg-crust`, etc. Prefer semantic roles where they fit: `bg-background`, `text-foreground`, `text-primary`, `bg-secondary`, `border-border`.
- **Fonts:** **Montserrat** via `next/font/google` in `src/app/layout.tsx` (`--font-montserrat`), applied to both `--font-sans` and `--font-mono` in `@theme inline` so UI and numeric lines share one family.
- **Database:** PostgreSQL. SQL migrations live in `migrations/` at the repo root. Docker Compose runs a one-shot `migrate` service before `web` / `test`; see `deploy/docker/scripts/run-migrations.sh` and `deploy/compose/*.yml`.

## Next.js version note

This project may use a newer Next.js than older training data. Prefer **local** sources: `node_modules/next` types, `next.config.ts`, and official docs for the installed version. If something looks deprecated, verify before relying on it.

## React Server Components (default)

The App Router treats modules as **Server Components** unless the file starts with **`"use client"`**.

1. **Prefer server for app code:** `page.tsx`, `layout.tsx`, and feature UI should be Server Components when possible. They can `import` client components as children; the server file itself stays a server module.
2. **Add `"use client"` only when needed:** `useState`, `useEffect`, other hooks, browser APIs (`window`, `document`, `matchMedia`, …), or event handlers that must attach in that module, or libraries that only run on the client (e.g. many Radix primitives).
3. **Shrink the client boundary:** If only part of a screen is interactive, move that part into a small client file (e.g. `feature-interactive.tsx`) and keep the route or parent as a server component that composes it.
4. **UI kit:** Files under `src/components/ui/` often use `"use client"` because of Radix/hooks — that is expected. Do not add `"use client"` to a file **only** because it imports `@/components/ui`; the importer can remain a server component.
5. **Data:** Prefer fetching and secrets on the server (Server Components, Route Handlers, server actions) unless the data must live in the browser.

## Repository layout

| Path                    | Purpose                                                                                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`              | App Router: `layout.tsx`, `page.tsx`, routes, route groups, layouts.                                                                                                                          |
| `src/components/ui/`    | **Shared UI kit** — organized by kind (see [UI component structure](#ui-component-structure)). Public API: `@/components/ui` (`index.ts`). **Do not** recreate primitives in feature folders. |
| `src/components/icons/` | **Inline SVG icon components** — `@/components/icons` (`index.ts`). Not under `ui/`; see [Icons](#icons).                                                                                     |
| `src/components/hooks/` | **Shared React hooks** — `@/components/hooks` (see [Hooks](#hooks)). One hook per file (`use-*.ts`), re-exported from `index.ts` when useful.                                                 |
| `src/app/showcase/`     | **UI showcase** — `/showcase` previews primitives and variants; update when adding or changing shared UI.                                                                                     |
| `src/utils/`            | `tailwind-utils.ts` (`cn()` for Tailwind class merging). `formatting/` for shared formatters: `date-formatting.ts`, `number-formatting.ts`, `string-formatting.ts`.                           |
| `src/`                  | Feature components and other shared code outside `ui/`. **Reusable hooks** live in `src/components/hooks/` (not loose files under `src/hooks/` unless justified).                             |
| `public/brand/`         | **Brand marks** — round / long / short logos (favicon, header). Not for generic UI icons; see [Icons](#icons).                                                                                |
| `public/icons/`         | **Static icon assets** — `.svg`, `.png`, and similar files served as `/icons/…` (see [Icons](#icons)).                                                                                        |
| `docs/`                 | Contributor docs (`CONTRIBUTING.md`) and [docs index](docs/README.md).                                                                                                                        |
| `migrations/`           | Ordered `*.sql` files; applied idempotently via `schema_migrations`.                                                                                                                          |
| `deploy/docker/`        | Dockerfiles (`Dockerfile.dev`, `Dockerfile.test`, `Dockerfile.prod`) and `scripts/run-migrations.sh`.                                                                                         |
| `deploy/compose/`       | `docker-compose.dev.yml`, `docker-compose.test.yml`, `docker-compose.prod.yml`.                                                                                                               |

Add feature modules under `src/` with clear boundaries (e.g. `src/components/`, `src/utils/formatting/`, `src/app/(dashboard)/`) as the app grows.

### Hooks

**Location:** `src/components/hooks/`.

- Add **shared** custom hooks here (used in more than one place or clearly library-level). Name files **`use-kebab-case.ts`** (e.g. `use-mouse-reactive-gradient.ts`) and export the hook as a named function **`useThing`**.
- **Barrel:** `src/components/hooks/index.ts` re-exports hooks so consumers can import from **`@/components/hooks`** or **`@/components/hooks/use-something`**.
- Hooks that are **only** used by a single feature may stay next to that feature until reuse is needed; prefer moving them into `components/hooks/` when they stabilize or are shared.
- Hooks that use browser-only APIs (`window`, `document`, `matchMedia`, etc.) are only safe from **client** components; do not call them from Server Components.

## UI component structure

Shared primitives live under `src/components/ui/`. **One main component per file** (plus small colocated helpers). Group related pieces in a **kebab-case folder** named after the feature (e.g. `multi-select/`, `dialog/`).

| Area              | Path pattern                                      | Notes                                                                                                                                                                  |
| ----------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form controls     | `inputs/<name>/`                                  | e.g. `inputs/field/`, `inputs/input/`, `inputs/label/`, `inputs/text-field/`, `inputs/select/`. Split `FooField` and `FooControl` into separate files when both exist. |
| Buttons           | `buttons/button/`, `buttons/button-with-tooltip/` | `Button` and `buttonVariants` live in `buttons/button/`.                                                                                                               |
| Layout / overlays | `card/`, `dialog/`, `dropdown-menu/`, `tooltip/`  | One file per exported part (`DialogContent.tsx`, `CardHeader.tsx`, …).                                                                                                 |
| Shared types      | Next to the feature                               | e.g. `inputs/multi-select/types.ts` to avoid circular imports between sibling modules.                                                                                 |

Inline SVG **icon components** live in **`src/components/icons/`** (not under `ui/`); see [Icons](#icons).

**Barrel:** `src/components/ui/index.ts` re-exports the public API. **Import from `@/components/ui`** for app code unless you need a deep path for internal reuse.

**Conventions:** Use `cn()` from `@/utils/tailwind-utils`. Match naming and imports in sibling files; add `"use client"` only where the UI primitive requires it (see [React Server Components](#react-server-components-default)). After adding or changing a primitive, **extend the showcase** (below).

### Icons

All icon assets follow one of two locations; do not leave ad hoc icon files under unrelated `public/` paths.

| Kind                                          | Location                    | Use when                                                                                                                                                                                                                      |
| --------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Static files** (`.svg`, `.png`, `.webp`, …) | **`public/icons/`**         | You reference a file by URL: `next/image`, `<img src="/icons/name.svg">`, CSS `url()`, or metadata. Subfolders are allowed (e.g. `public/icons/categories/groceries.png`).                                                    |
| **React components** (inline SVG)             | **`src/components/icons/`** | Shared across the app (e.g. selects, multi-select). One component per file (`PascalCase.tsx`), export from `index.ts`, import via **`@/components/icons`**. Prefer `currentColor` for stroke/fill so icons follow text color. |

**Brand logos** stay in **`public/brand/`** only — not under `public/icons/`.

### Showcase page

The route **`/showcase`** uses a **server** `page.tsx` that renders the client module **`showcase-content.tsx`** (metadata stays in `layout.tsx`). When you **add a new component**, **new variants**, or **meaningful behavior** to `src/components/ui/`:

1. Add or update a **section** in **`src/app/showcase/showcase-content.tsx`** that demonstrates the component (and variants, if any).
2. Keep demos **interactive** where state matters (dialogs, selects, menus); that file remains a client component.
3. Prefer **realistic copy** (labels, placeholders) so spacing and typography stay honest.

Do not leave the showcase stale after user-visible kit changes.

## Commands

| Task               | Command                                                                |
| ------------------ | ---------------------------------------------------------------------- |
| Dev (local)        | `npm run dev`                                                          |
| Lint               | `npm run lint`                                                         |
| Test (placeholder) | `npm run test` (currently lint; extend with a real runner when needed) |
| Production build   | `npm run build` then `npm run start`                                   |
| Docker dev         | `docker compose -f deploy/compose/docker-compose.dev.yml up --build`   |

Environment: copy `.env.example` to `.env` for local Postgres / ports. Compose sets `DATABASE_URL` for services in Docker.

### Cleaning Next.js output

Remove generated artifacts when you need a clean slate: delete the `.next` directory (and optionally `.turbo` if present). If Docker created files as root, fix ownership or remove with elevated permissions, for example: `sudo rm -rf .next` or `sudo chown -R "$(whoami)" .next`.

## UI and theming rules

1. **Reuse `src/components/ui`:** Build screens from the existing kit (`Button`, `ButtonWithTooltip`, `Dialog`, `Field`, `TextField`, `NumericField`, `CurrencyField`, `TextareaField`, `SelectField`, `MultiSelectField`, `RadioField`, `DropdownMenu` / `Menu`, `Card`, `Tooltip`, …). Import from `@/components/ui` (see [UI component structure](#ui-component-structure)). Only add a new primitive in `ui/` when something is genuinely missing; do not duplicate buttons, inputs, or modals ad hoc in feature folders. **New or changed primitives:** update the [showcase page](#showcase-page).
2. **Styling:** Do not hardcode one-off hex colors for core UI unless the task requires it. Use Mocha tokens (`text-text`, `bg-surface-0`, `border-border`, …) or roles (`primary`, `secondary`, `foreground`, `muted`). Use `cn()` from `@/utils/tailwind-utils` to merge Tailwind classes.
3. **Tailwind v4:** Add new CSS variables under `:root` and map them in `@theme inline` in `globals.css`.
4. **Theme:** The app is **Catppuccin Mocha** (dark). `html` uses **crust** as the outer shell; `body` uses **base** as the main background. A light theme (e.g. Latte) can be added later by extending `:root` or a class on `<html>`.
5. **Logos:** Round / long / short brand assets under `public/brand/`. Do not remove without replacing usages.
6. **Forms:** Prefer `*Field` components for labeled controls with errors; use `inputClassName` when styling the inner control and `className` on the field for the outer wrapper. `TooltipProvider` wraps the app in `layout.tsx` for `ButtonWithTooltip` / `Tooltip`.
7. **Icons:** Put static `.svg` / `.png` (and similar) under **`public/icons/`**; put shared inline-SVG React icons under **`src/components/icons/`**. See [Icons](#icons).
8. **Server vs client:** Prefer Server Components for routes and non-interactive UI; keep client boundaries small. See [React Server Components](#react-server-components-default).

### Catppuccin Mocha reference (implemented)

| Role                  | Hex                               |
| --------------------- | --------------------------------- |
| Primary (red)         | `#f38ba8`                         |
| Secondary (mauve)     | `#cba6f7`                         |
| Text                  | `#cdd6f4`                         |
| Subtext 1 / 0         | `#bac2de` / `#a6adc8`             |
| Overlay 2 → 0         | `#9399b2` → `#7f849c` → `#6c7086` |
| Surface 2 → 0         | `#585b70` → `#45475a` → `#313244` |
| Base / Mantle / Crust | `#1e1e2e` / `#181825` / `#11111b` |

## Database and migrations

- Add new SQL files as `migrations/00x_description.sql` (lexicographic order).
- The runner records filenames in `schema_migrations`; do not rename applied files without a deliberate migration strategy.
- Keep Postgres-specific SQL portable enough for your deployment target; avoid app-only logic in SQL unless necessary.

## Docker notes

- Do **not** use `docker compose up --abort-on-container-exit` with these stacks: the `migrate` service exits after success and can interact badly with that flag.
- Production image uses `output: "standalone"` in `next.config.ts`.

## What not to do

- Do not commit secrets or real `.env` files.
- Do not introduce large refactors unrelated to the task; match existing patterns and file layout.
- Do not edit `.pen` design files with plain text tools; use the Pencil MCP tooling if those assets exist.

## When in doubt

Prefer small, reviewable changes; one feature per branch; semantic theme tokens; typed server boundaries where data crosses the DB or API.
