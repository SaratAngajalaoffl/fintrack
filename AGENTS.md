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

## Repository layout

| Path                 | Purpose                                                                                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`           | App Router: `layout.tsx`, `page.tsx`, routes, route groups, layouts.                                                                                                                            |
| `src/components/ui/` | **Shared UI kit** — buttons, fields, dialogs, menus, cards, etc. Import from `@/components/ui` (see `index.ts`). **Do not** recreate primitives; extend these components when building screens. |
| `src/utils/`         | `tailwind-utils.ts` (`cn()` for Tailwind class merging). `formatting/` for shared formatters: `date-formatting.ts`, `number-formatting.ts`, `string-formatting.ts`.                             |
| `src/`               | Feature components, hooks, and other shared code outside `ui/`.                                                                                                                                 |
| `public/brand/`      | Logos: round / long / short assets (favicon, header, future use). No secrets.                                                                                                                   |
| `docs/`              | Contributor docs (`CONTRIBUTING.md`) and [docs index](docs/README.md).                                                                                                                          |
| `migrations/`        | Ordered `*.sql` files; applied idempotently via `schema_migrations`.                                                                                                                            |
| `deploy/docker/`     | Dockerfiles (`Dockerfile.dev`, `Dockerfile.test`, `Dockerfile.prod`) and `scripts/run-migrations.sh`.                                                                                           |
| `deploy/compose/`    | `docker-compose.dev.yml`, `docker-compose.test.yml`, `docker-compose.prod.yml`.                                                                                                                 |

Add feature modules under `src/` with clear boundaries (e.g. `src/components/`, `src/utils/formatting/`, `src/app/(dashboard)/`) as the app grows.

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

1. **Reuse `src/components/ui`:** Build screens from the existing kit (`Button`, `ButtonWithTooltip`, `Dialog`, `Field`, `TextField`, `NumericField`, `CurrencyField`, `TextareaField`, `SelectField`, `MultiSelectField`, `RadioField`, `DropdownMenu` / `Menu`, `Card`, `Tooltip`, …). Import from `@/components/ui` or `@/components/ui/<name>`. Only add a new primitive in `ui/` when something is genuinely missing; do not duplicate buttons, inputs, or modals ad hoc in feature folders.
2. **Styling:** Do not hardcode one-off hex colors for core UI unless the task requires it. Use Mocha tokens (`text-text`, `bg-surface-0`, `border-border`, …) or roles (`primary`, `secondary`, `foreground`, `muted`). Use `cn()` from `@/utils/tailwind-utils` to merge Tailwind classes.
3. **Tailwind v4:** Add new CSS variables under `:root` and map them in `@theme inline` in `globals.css`.
4. **Theme:** The app is **Catppuccin Mocha** (dark). `html` uses **crust** as the outer shell; `body` uses **base** as the main background. A light theme (e.g. Latte) can be added later by extending `:root` or a class on `<html>`.
5. **Logos:** Round / long / short brand assets under `public/brand/`. Do not remove without replacing usages.
6. **Forms:** Prefer `*Field` components for labeled controls with errors; use `inputClassName` when styling the inner control and `className` on the field for the outer wrapper. `TooltipProvider` wraps the app in `layout.tsx` for `ButtonWithTooltip` / `Tooltip`.

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
