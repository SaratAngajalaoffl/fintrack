# Fintrack — agent guide

<!-- BEGIN:nextjs-agent-rules -->

This project uses a current Next.js release; APIs and conventions may differ from older training data. Prefer `node_modules/next` types and docs for the installed version.

<!-- END:nextjs-agent-rules -->

This document orients coding agents and contributors to how Fintrack is organized, built, and styled. Read it before adding features or restructuring the repo.

## Agent workflow (Cursor / automation)

- **Do not create git commits** unless the user explicitly asks you to commit. Implement changes and leave them **uncommitted** so the user can review the diff and commit themselves.
- **Keep this file current:** whenever routes, APIs, schemas, architecture, conventions, or developer workflows change, update **`AGENTS.md`** in the same task so guidance stays accurate.
- **Tests:** When you add or change behavior in **`api/`** (handlers, auth, repository, middleware, migrations), add or update **Go tests** in the same task: fast **unit tests** for pure logic (`internal/auth`, `httpx`, `middleware`, helpers) and **integration tests** against Postgres (Docker) for HTTP + SQL paths (`internal/integration`, `internal/migrate`, shared **`internal/testutil`**). Run **`cd api && make test`** before finishing. Do not merge behavior-only changes without tests unless the user explicitly excuses tests for a spike.

## Product

**Fintrack** is a responsive personal finance web app (Next.js). Core domains will include accounts, transactions, categories, and reporting — implement incrementally; keep changes scoped to the task.

### Domain: bank accounts

- **Routes:** `/dashboard/bank-accounts/my-bank-accounts` (**My Bank Accounts**) and `/dashboard/bank-accounts/statements` (**Bank Statements**). Keep `/dashboard/bank-accounts` as a redirect-only compatibility route.
- **Code:** Domain types, URL state parsing, and mock rows live under **`web/src/lib/bank-accounts/`**. Composed screen UI lives under **`web/src/components/ui/bank-accounts/`**. Shared primitives for this area: **`ChipComponent`** (`web/src/components/ui/common/chip/`) and **`TableComponent`** (`web/src/components/ui/common/table-component/`) — export from `@/components/ui`.
- **API:** **`GET`/`POST /api/bank-accounts`**, **`GET`/`PATCH`/`DELETE /api/bank-accounts/:id`** — implemented in **`api/`**; **`getApiRoute()`** + optional **`NEXT_PUBLIC_API_ORIGIN`** (see **`web/src/configs/api-routes.ts`**). Client helpers: **`web/src/services/bank-accounts/bank-accounts-api.ts`**.
- **Persistence:** Core account settings live in `bank_accounts`; preferred categories are normalized in `bank_account_preferred_categories` (migration `012_bank_account_preferred_category_links.sql`). Planned/implemented fields are documented in **[docs/data-model.md](docs/data-model.md)**. Update that file when migrations or API shapes change.

### Domain: credit cards

- **Routes:** `/dashboard/credit-cards/my-credit-cards` (**My Credit Cards**) and `/dashboard/credit-cards/bills` (**Credit Card Bills**). Keep `/dashboard/credit-cards` as a redirect-only compatibility route.
- **Code:** Domain types and list URL state live under **`web/src/lib/credit-cards/`**. Composed screen UI lives under **`web/src/components/ui/credit-cards/`**.
- **API:** **`GET`/`POST /api/credit-cards`**, **`GET`/`PATCH`/`DELETE /api/credit-cards/:id`** — implemented in **`api/`**; **`getApiRoute()`**. Client helpers: **`web/src/services/credit-cards/credit-cards-api.ts`**.
- **Persistence:** Core card settings live in `credit_cards`; preferred categories are normalized in **`credit_card_preferred_categories`** (migration `009_credit_card_preferred_category_links.sql`); bill records are normalized in **`credit_card_bills`** (migration `010_credit_card_bills.sql`). Do not reintroduce `preferred_categories` or `previous_bill_*` fields on `credit_cards`.

### Domain: expense categories

- **Routes:** `/dashboard/organisation/expense-categories` (**Expense Categories**).
- **Code:** Types and UI live under **`web/src/lib/expense-categories/`** and **`web/src/components/ui/expense-categories/`**.
- **API:** **`GET`/`POST /api/expense-categories`**, **`GET`/`PATCH`/`DELETE /api/expense-categories/:id`** — implemented in **`api/`**; **`getApiRoute()`**. Client helpers: **`web/src/services/expense-categories/expense-categories-api.ts`**. Allowed **`color`** tokens match **`CATPPUCCIN_MOCHA_COLOR_OPTIONS`** in **`web/src/lib/expense-categories/types.ts`** (and DB check in migration `008_expense_category_colors_palette.sql`).

### Domain: fund buckets

- **Routes:** `/dashboard/organisation/fund-buckets` (**Fund Buckets**).
- **Code:** Domain types live under **`web/src/lib/fund-buckets/`**.
- **API:** **`/api/fund-buckets`** (`GET`/`POST`) and **`/api/fund-buckets/:id/allocate`**, **`unlock`**, **`priority`** — implemented in **`api/`**; **`getApiRoute()`**. Client: **`web/src/services/fund-buckets/fund-buckets-api.ts`**.
- **Persistence:** Fund buckets live in **`fund_buckets`** (migration `013_fund_buckets.sql`) with lock state (`is_locked`), progress (`current_value`), and priority (`high`/`medium`/`low`).

### Dashboard navigation map

- **Bank Accounts:** `/dashboard/bank-accounts/my-bank-accounts` (My Bank Accounts), `/dashboard/bank-accounts/statements` (Bank Statements).
- **Credit Cards:** `/dashboard/credit-cards/my-credit-cards` (My Credit Cards), `/dashboard/credit-cards/bills` (Credit Card Bills).
- **Expenses:** `/dashboard/expenses/my-expenses` (My Expenses), `/dashboard/expenses/emis` (EMIs), `/dashboard/expenses/loans` (Loans).
- **Receivables:** `/dashboard/receivables/income` (Income), `/dashboard/receivables/lending` (Lending).
- **Transactions:** `/dashboard/transactions/internal` (Internal), `/dashboard/transactions/credits` (Credits), `/dashboard/transactions/debits` (Debits).
- **Organisation:** `/dashboard/organisation/expense-categories` (Expense Categories), `/dashboard/organisation/fund-buckets` (Fund Buckets), `/dashboard/organisation/expense-groups` (Expense Groups).

## Go API + Next.js

HTTP APIs for app domains are implemented in the **Go** service (**`api/`**). **`getApiRoute()`** in **`web/src/configs/api-routes.ts`** resolves API URLs using **`NEXT_PUBLIC_API_ORIGIN`** (browser) and **`API_ORIGIN`** (server-side / middleware) when set (see **`web/.env.example`**). Session JWTs are signed and verified only in **`api/`**; Next **`middleware.ts`** and **`getSession()`** call **`GET /api/auth/me`** instead of verifying JWTs locally.

**Route paths** stay aligned with **`web/src/configs/api-routes.ts`**.

### Go API tests (`api/`)

- **Unit tests** (`go test`, no Docker): packages such as **`internal/auth`**, **`internal/httpx`**, **`internal/middleware`**, **`internal/config`**, **`internal/handler`** (helpers), **`internal/migrate`** (`DirExists`), **`internal/repository`** (`IsUniqueViolation`), **`pkg/logger`**.
- **Integration tests** (Docker required): **`internal/integration`** (full HTTP flows + DB), **`internal/migrate`** (`migrate_integration_test.go`), using **`internal/testutil`** to start **Postgres 16** via **testcontainers** and apply **`api/migrations/`**. If Docker is unavailable, those tests **skip** (`t.Skip`).
- **Commands:** from **`api/`**: **`make test`** runs the full suite; **`make test-cover`** writes **`coverage.out`** and prints total statement coverage (uses **`-coverpkg=./internal/...,./pkg/...`** so integration tests count toward handler/repository coverage). See **`api/Makefile`** and **`api/README.md`**.
- **Coverage expectations:** Combined coverage for **`internal/`** + **`pkg/`** is typically **~60%** statement coverage with the current suite (integration tests exercise happy paths across domains; **`cmd/api`** has no tests). Pushing toward **~100%** would mean many more table-driven cases (validation failures, DB errors, 404s) and/or test doubles for the DB layer—do that when a domain is high-risk or when you are hardening a specific package, not as a blanket requirement for every small change.

## Tech stack

- **Framework:** Next.js (App Router), React, TypeScript.
- **API:** Go service in **`api/`** — app HTTP lives here (auth, bank accounts, credit cards, expense categories, fund buckets). Use **`getApiRoute()`** for endpoint resolution. There are **no** Next Route Handlers under **`web/src/app/api/`** for these domains; see [Go API + Next.js](#go-api--nextjs).
- **Styling:** Tailwind CSS v4. Theme tokens live in `web/src/app/globals.css` (`@import "tailwindcss"` + `@theme inline`). **Catppuccin Mocha** is the app palette: **red** (`#f38ba8`) as `primary`, **mauve** (`#cba6f7`) as `secondary`. Named Mocha colors are exposed as Tailwind colors: `text-text`, `text-subtext-1`, `text-subtext-0`, `bg-overlay-*`, `bg-surface-*`, `bg-base`, `bg-mantle`, `bg-crust`, etc. Prefer semantic roles where they fit: `bg-background`, `text-foreground`, `text-primary`, `bg-secondary`, `border-border`.
- **Client data layer:** `@tanstack/react-query` powers browser-side API calls (mutations/queries) behind a small `ReactQueryProvider` client boundary in root layout. Keep routes and non-interactive UI as Server Components.
- **Fonts:** **Montserrat** via `next/font/google` in `web/src/app/layout.tsx` (`--font-montserrat`), applied to both `--font-sans` and `--font-mono` in `@theme inline` so UI and numeric lines share one family.
- **Database:** PostgreSQL. SQL migrations live in **`api/migrations/`**. The **Go API** (`api/cmd/api`) applies them **on startup** (same **`schema_migrations`** filenames as before). Docker Compose starts **`postgres` → `api` → `web`** (or **`test`**). Seeding is **not** part of the API (use your own scripts / `data/`).

## Next.js version note

This project may use a newer Next.js than older training data. Prefer **local** sources: **`web/node_modules/next`** types, **`web/next.config.ts`**, and official docs for the installed version. If something looks deprecated, verify before relying on it.

## React Server Components (default)

The App Router treats modules as **Server Components** unless the file starts with **`"use client"`**.

1. **Prefer server for app code:** `page.tsx`, `layout.tsx`, and feature UI should be Server Components when possible. They can `import` client components as children; the server file itself stays a server module.
2. **Add `"use client"` only when needed:** `useState`, `useEffect`, other hooks, browser APIs (`window`, `document`, `matchMedia`, …), or event handlers that must attach in that module, or libraries that only run on the client (e.g. many Radix primitives).
3. **Shrink the client boundary:** If only part of a screen is interactive, move that part into a small client file (e.g. `feature-interactive.tsx`) and keep the route or parent as a server component that composes it.
4. **UI kit:** Files under `web/src/components/ui/` often use `"use client"` because of Radix/hooks — that is expected. Do not add `"use client"` to a file **only** because it imports `@/components/ui`; the importer can remain a server component.
5. **Data:** Prefer fetching and secrets on the server (Server Components, Route Handlers, server actions) unless the data must live in the browser. For client-side API calls, keep fetch/request functions in `web/src/services/` and consume them via React Query hooks under `web/src/components/hooks/queries/`.

### shadcn/ui and Radix

The project follows **[shadcn/ui](https://ui.shadcn.com)** conventions: **`web/components.json`** (run shadcn CLI from **`web/`**), **`cn()` in `web/src/lib/utils.ts`** (`clsx` + `tailwind-merge`, matches the CLI alias), plus composable components under `web/src/components/ui/`.

**Important:** Official shadcn registry components are **implemented with [Radix UI](https://www.radix-ui.com) primitives** (e.g. `@radix-ui/react-dialog`, `@radix-ui/react-select`) plus Tailwind. Those **`@radix-ui/react-*` packages are required dependencies** — they are not optional add-ons. You **cannot** remove Radix from **`web/package.json`** and keep stock shadcn components; there is no supported “Radix-free” shadcn build.

- **Prefer** adding or updating UI via the CLI from **`web/`**: `npx shadcn@latest add <component>` (or `add --all` after backing up), rather than hand-rolling new Radix wrappers.
- Import **`cn`** from **`@/lib/utils`** (same path the shadcn CLI uses via `components.json` aliases).
- If you **must** avoid Radix entirely, you would need a **different** stack (e.g. [React Aria](https://react-spectrum.adobe.com/react-aria/), native `<dialog>`, custom controls) — **not** the default shadcn registry — and expect a full rewrite of interactive primitives.

## Repository layout

The repo is a **meta-repo**: **`web/`** and **`api/`** are **Git submodules** (separate remotes; pinned commits in this repo). Clone with **`git clone --recurse-submodules <url>`** or run **`git submodule update --init --recursive`** after a plain clone. **`.gitmodules`** lists [fintrack-web](https://github.com/SaratAngajalaoffl/fintrack-web) and [fintrack-api](https://github.com/SaratAngajalaoffl/fintrack-api). Install and run Node from **`web/`**; Go from **`api/`** (see **`api/README.md`** inside the submodule). Optional **native Git hooks** live under **`.githooks/`** — enable with **`git config core.hooksPath .githooks`** once per clone (see root **README.md**).

| Path                    | Purpose                                                                                                                                                                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/`    | **GitHub Actions** — e.g. **`ci.yml`** runs **`web`** and **`api`** via **`deploy/docker-compose.test.yml`** profiles + **`test-summary/action`** on JUnit outputs.                                                                                                                                                                                                  |
| `.githooks/`            | **Native Git hooks** (e.g. `pre-commit` → `lint-staged` in **`web/`**). Enable per clone: **`git config core.hooksPath .githooks`**.                                                                                                                                                         |
| `api/`                  | **Go HTTP API** — `api/go.mod`, **`api/cmd/api/`**, ordered SQL in **`api/migrations/`** (applied on startup). Dockerfiles under **`api/deploy/`** (see [Docker notes](#docker-notes)).                                                      |
| `web/package.json`      | Next.js app metadata and scripts — use **`cd web`**, then **`npm install`**, **`npm run dev`**, etc.                                                                                                                                                                                          |
| `web/components.json`   | **shadcn/ui** CLI config (registry style, aliases, `globals.css` path). Run the CLI from **`web/`**.                                                                                                                                                                                         |
| `web/src/app/`              | App Router: `layout.tsx`, `page.tsx`, routes, route groups, layouts.                                                                                                                                                                                                                         |
| `web/src/components/ui/`    | **UI kit** (primitives) **plus** composed app UI — see [UI component structure](#ui-component-structure). Primitives: `@/components/ui` (`index.ts`). **Do not** recreate primitives in feature folders.                                                                                     |
| `web/src/components/icons/` | **Inline SVG icon components** — `@/components/icons` (`index.ts`). Not under `ui/`; see [Icons](#icons).                                                                                                                                                                                    |
| `web/src/components/hooks/` | **Shared React hooks** — `@/components/hooks` (see [Hooks](#hooks)). Query hooks live in `hooks/queries/` (e.g. `use-mutate-login.ts`), re-exported from `index.ts`.                                                                                                                         |
| `web/src/app/showcase/`     | **UI showcase** — `/showcase` previews primitives and variants; update when adding or changing shared UI.                                                                                                                                                                                    |
| `web/src/configs/`          | **Route registries** — `app-routes.ts` and `api-routes.ts` expose typed route maps plus `getAppRoute()` / `getApiRoute()` helpers; prefer these instead of hardcoded strings.                                                                                                                |
| `web/src/services/`         | **Client data services** — React Query provider plus API request helpers (e.g. `services/auth/auth-api.ts`). Components should call query hooks instead of inlining fetch logic.                                                                                                             |
| `web/src/lib/`              | **`utils.ts`** — **`cn()`** for Tailwind class merging. **`formatting/`** — shared formatters (`date-formatting.ts`, `number-formatting.ts`, `string-formatting.ts`). **`bank-accounts/`** — types, list URL state, mocks until APIs exist. Auth, DB, and other app libraries live here too. |
| `web/public/brand/`         | **Brand marks** — round / long / short logos (favicon, header). Not for generic UI icons; see [Icons](#icons).                                                                                                                                                                               |
| `web/public/icons/`         | **Static icon assets** — `.svg`, `.png`, and similar files served as `/icons/…` (see [Icons](#icons)).                                                                                                                                                                                       |
| `docs/`                 | Contributor docs (`CONTRIBUTING.md`) and [docs index](docs/README.md).                                                                                                                                             |
| `api/deploy/`           | Go API Dockerfiles: **`Dockerfile.dev`** (Air live reload), **`Dockerfile.prod`** (release image), **`Dockerfile.test`** (one-shot **`gotestsum`** + **`junit.xml`**; mount Docker socket). CI summary: **`test-summary/action`** on **`api/junit.xml`**.                                                                                                                            |
| `web/deploy/`           | Next.js Dockerfiles: **`Dockerfile.test`** runs **`npm run lint:junit`** (writes **`eslint-junit.xml`**) + **`npm run build`**; test Compose profile **`web-tests`** bind-mounts **`web/`** and uses **`test-summary/action`** on **`web/eslint-junit.xml`** in CI. **`Dockerfile.dev`**, **`Dockerfile.prod`**.                                                                                                                                                                                                |
| `deploy/`               | Compose stacks (`docker-compose.dev.yml`, `docker-compose.test.yml`, `docker-compose.prod.yml`).                                                                                                                                                           |

Add feature modules under `web/src/` with clear boundaries (e.g. `web/src/lib/formatting/`, `web/src/app/(dashboard)/`, composed UI under `web/src/components/ui/forms/` / `common/` / `landing/` / `layout/`) as the app grows.

### Meta-repo migration (separate `web` / `api` Git repos)

**Goal:** Keep this repository as the **meta-repo** (Compose, CI, docs, `AGENTS.md`, …) while **`web/`** and **`api/`** are **separate Git repositories** wired in as **Git submodules** (same paths on disk: `web/`, `api/`). **Update this subsection** as steps complete so anyone can resume after an interruption.

**Target clone (after migration):** `git clone --recurse-submodules <meta-repo-url>` (or `git submodule update --init --recursive` after a plain clone).

**Child remotes (default branch `main`) — Phase 1 done:** [fintrack-api](https://github.com/SaratAngajalaoffl/fintrack-api), [fintrack-web](https://github.com/SaratAngajalaoffl/fintrack-web). Both started empty on GitHub; `main` receives the first push from Phase 2.

**Phase 2 — Fill the child repos (preserve monorepo history)** — run from the **meta-repo / monorepo** root with GitHub auth (HTTPS or SSH URL). Uses built-in **`git subtree split`** (content ends at repo root in each child).

```bash
# API: split prefix api/ → branch, push to child main, remove local split branch
git subtree split -P api -b __fintrack_api_split
git push git@github.com:SaratAngajalaoffl/fintrack-api.git __fintrack_api_split:main
git branch -D __fintrack_api_split

# Web: same for web/
git subtree split -P web -b __fintrack_web_split
git push git@github.com:SaratAngajalaoffl/fintrack-web.git __fintrack_web_split:main
git branch -D __fintrack_web_split
```

Use **`https://github.com/SaratAngajalaoffl/…`** instead of **`git@github.com:…`** if you do not use SSH. Large histories: split can take several minutes and needs enough local disk. **Alternative (no history):** copy `api/` or `web/` into a fresh clone of the empty repo, commit, push to `main`.

| Phase | What to do |
| ----- | ---------- |
| **0 — Decide** | Confirm **submodules** (vs **subtree**): submodules = separate PRs per app, pinned SHAs in meta-repo; subtree = less tooling, heavier merges. Default here: **submodules**. |
| **1 — Create empty remotes** | ✅ GitHub: [fintrack-api](https://github.com/SaratAngajalaoffl/fintrack-api), [fintrack-web](https://github.com/SaratAngajalaoffl/fintrack-web), branch **`main`**. |
| **2 — Extract history (optional)** | Run the **Phase 2** block above (or **`git filter-repo`** / fresh **`git init`** if you prefer those workflows). |
| **3 — Wire submodules in meta-repo** | ✅ **`.gitmodules`** + submodule **`api`** / **`web`** (HTTPS remotes above). If paths were still tracked, **`git rm -rf`** them first, then: `git submodule add https://github.com/SaratAngajalaoffl/fintrack-api.git api` and `…/fintrack-web.git web`. Commit **`.gitmodules`** + gitlink entries. |
| **4 — CI / automation** | In **`.github/workflows/`**, set **`actions/checkout@v4`** with **`submodules: recursive`** (or `true`) so `web/` and `api/` exist in CI. Verify paths **`web/eslint-junit.xml`** and **`api/junit.xml`** still match **`deploy/docker-compose.test.yml`**. |
| **5 — Docs & hooks** | Update root **README.md** (clone with submodules), **CONTRIBUTING.md** / **docs/** if present, and any scripts that assumed a single repo. **`.githooks/`**: if hooks run inside `web/`, document that developers need submodules initialized first. |
| **6 — Cutover** | Archive or retire the old “everything in one repo” remote if you split history; align default branches; pin submodule versions on **`main`** via normal meta-repo PRs. |

**Invariant for this codebase:** Compose files under **`deploy/`** already use **`context: ../web`** and **`context: ../api`** relative to **`deploy/`** — that layout **unchanged** as long as **`web/`** and **`api/`** remain those directory names at the repo root.

### Hooks

**Location:** `web/src/components/hooks/`.

- Add **shared** custom hooks here (used in more than one place or clearly library-level). Name files **`use-kebab-case.ts`** (e.g. `use-mouse-reactive-gradient.ts`) and export the hook as a named function **`useThing`**.
- **Barrel:** `web/src/components/hooks/index.ts` re-exports hooks so consumers can import from **`@/components/hooks`** or **`@/components/hooks/use-something`**.
- **Query hooks:** Put React Query hooks in `web/src/components/hooks/queries/` (e.g. `use-mutate-login.ts`, future `use-get-bank-accounts.ts`). Keep each hook focused on one endpoint or resource behavior.
- **Service split:** Keep raw request/fetch logic in `web/src/services/` and call those service functions from query hooks, not directly from UI components.
- Hooks that are **only** used by a single feature may stay next to that feature until reuse is needed; prefer moving them into `components/hooks/` when they stabilize or are shared.
- Hooks that use browser-only APIs (`window`, `document`, `matchMedia`, etc.) are only safe from **client** components; do not call them from Server Components.

## UI component structure

Everything under `web/src/components/` is organized as **`hooks/`**, **`icons/`**, and **`ui/`**. Do **not** add a top-level `web/src/components/auth/` (or similar domain folders): authentication **routes** live under `web/src/app/`, **app HTTP** for migrated domains is in **`api/`** (see [Go API + Next.js](#go-api--nextjs)); **`web/src/app/api/`** may still hold other Route Handlers, and **shared auth-related UI** belongs under the `ui/` subtrees below.

### UI kit (primitives)

Shared primitives live under `web/src/components/ui/`. **One main component per file** (plus small colocated helpers). Group related pieces in a **kebab-case folder** named after the feature.

| Area               | Path pattern                                                                                    | Notes                                                                                                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form controls      | `common/inputs/<name>/`                                                                         | e.g. `common/inputs/field/`, `common/inputs/input/`, `common/inputs/label/`, `common/inputs/text-field/`, `common/inputs/select/`. Split `FooField` and `FooControl` into separate files when both exist. |
| Buttons & overlays | `common/buttons/`, `common/card/`, `common/dialog/`, `common/dropdown-menu/`, `common/tooltip/` | shadcn-style primitives: `Button`, `Card`, `Dialog`, menus, tooltips. One file per exported part (`DialogContent.tsx`, `CardHeader.tsx`, …).                                                              |
| Shared types       | Next to the feature                                                                             | e.g. `common/inputs/multi-select/types.ts` to avoid circular imports between sibling modules.                                                                                                             |

**Barrel:** `web/src/components/ui/index.ts` re-exports **primitives** from `common/` (`inputs/`, `buttons/`, `card/`, `dialog/`, …). **Import from `@/components/ui`** for `Button`, `Card`, `TextField`, etc.

### Composed app UI (also under `ui/`)

Screens and chrome built **from** the kit (and each other) live in sibling folders under `web/src/components/ui/`. **One kebab-case folder per component**; add an `index.ts` that re-exports the public symbol so consumers can import `@/components/ui/forms/login-form` (folder path) without repeating the file name.

| Area        | Path pattern     | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Forms**   | `forms/<name>/`  | Multi-field route forms: login, signup, forgot/reset/change password, etc. Colocate small helpers (e.g. OTP field) under `forms/` as their own folder when shared across forms.                                                                                                                                                                                                                                                                                   |
| **Common**  | `common/<name>/` | **Primitives** (see table above): `common/inputs/`, `common/buttons/`, `common/card/`, … **App chrome** in the same tree: `common/background/` (`InteractiveBackground`, site-wide in root `layout.tsx`), `common/toast/` (`Toaster` + re-exported `toast` from **Sonner** — mount `Toaster` once in root `layout.tsx`; call `toast.success` / `toast.error` / `toast.info` from client code), `common/header/` (`SiteHeader`), `common/user-profile-menu/`, etc. |
| **Landing** | `landing/`       | Marketing landing sections (e.g. hero).                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Layout**  | `layout/`        | Route-level layout wrappers (e.g. `AuthPageLayout` for auth pages).                                                                                                                                                                                                                                                                                                                                                                                               |

**Barrel:** `web/src/components/ui/common/index.ts` re-exports frequently used **app chrome** (interactive background, `toast` / `Toaster`, header, profile menu). **`forms/index.ts`** re-exports form entry points for convenience; prefer specific paths when only one form is needed. Prefer **`@/components/ui`** for primitives (`Button`, `Dialog`, …) rather than deep paths into `common/buttons/`, unless you are editing those modules.

Inline SVG **icon components** live in **`web/src/components/icons/`** (not under `ui/`); see [Icons](#icons).

**Conventions:** Use `cn()` from **`@/lib/utils`**. Match naming and imports in sibling files; add `"use client"` only where the UI primitive requires it (see [React Server Components](#react-server-components-default)). See [shadcn/ui and Radix](#shadcnui-and-radix). After adding or changing a primitive, **extend the showcase** (below).

### Icons

All icon assets follow one of two locations; do not leave ad hoc icon files under unrelated `public/` paths.

| Kind                                          | Location                    | Use when                                                                                                                                                                                                                      |
| --------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Static files** (`.svg`, `.png`, `.webp`, …) | **`web/public/icons/`**         | You reference a file by URL: `next/image`, `<img src="/icons/name.svg">`, CSS `url()`, or metadata. Subfolders are allowed (e.g. `public/icons/categories/groceries.png`).                                                    |
| **React components** (inline SVG)             | **`web/src/components/icons/`** | Shared across the app (e.g. selects, multi-select). One component per file (`PascalCase.tsx`), export from `index.ts`, import via **`@/components/icons`**. Prefer `currentColor` for stroke/fill so icons follow text color. |

**Brand logos** stay in **`web/public/brand/`** only — not under `web/public/icons/`.

### Showcase page

The route **`/showcase`** uses a **server** `page.tsx` that renders the client module **`showcase-content.tsx`** (metadata stays in `layout.tsx`). When you **add a new component**, **new variants**, or **meaningful behavior** to `web/src/components/ui/`:

1. Add or update a **section** in **`web/src/app/showcase/showcase-content.tsx`** that demonstrates the component (and variants, if any).
2. Keep demos **interactive** where state matters (dialogs, selects, menus); that file remains a client component.
3. Prefer **realistic copy** (labels, placeholders) so spacing and typography stay honest.

Do not leave the showcase stale after user-visible kit changes.

## Commands

Commands below assume a POSIX shell. **Node** commands run from **`web/`**; **Go** commands run from **`api/`**.

| Task               | Command                                                                |
| ------------------ | ---------------------------------------------------------------------- |
| CI (GitHub)        | **`.github/workflows/ci.yml`** on push/PR: **`web`** and **`api`** each run **`deploy/docker-compose.test.yml`** (**`--profile web-tests`** → **`web-test`**, **`--profile go-tests`** → **`api-go-tests`**), then **`test-summary/action`** on **`web/eslint-junit.xml`** / **`api/junit.xml`**, then **`docker compose … down --volumes`** and remove JUnit files. **`JWT_SECRET`** is set for the web job (starts **`api`**). Needs Docker. |
| Dev — Next (local) | `cd web && npm run dev`                                                |
| Dev — Go API       | `cd api && go run ./cmd/api`                                           |
| Test — Go API      | `cd api && make test` (integration tests need **Docker** for Postgres) |
| Coverage — Go API  | `cd api && make test-cover` (writes **`api/coverage.out`**)            |
| Lint               | `cd web && npm run lint`                                               |
| Test (placeholder) | `cd web && npm run test` (currently lint; extend with a real runner when needed) |
| Production build   | `cd web && npm run build` then `cd web && npm run start`                |
| Docker dev         | From repo root: `docker compose -f deploy/docker-compose.dev.yml up --build` |

Environment: copy **`api/.env.example`** → **`api/.env`** and **`web/.env.example`** → **`web/.env.local`** (or **`web/.env`**). For Docker Compose from the repo root, optionally add a root **`.env`** with **`POSTGRES_*`** / ports; Compose sets `DATABASE_URL` for the `api` and `web` services (see root README).

### Cleaning Next.js output

Remove generated artifacts when you need a clean slate: delete **`web/.next`** (and optionally **`.turbo`** if present). If Docker created files as root, fix ownership or remove with elevated permissions, for example: `sudo rm -rf web/.next` or `sudo chown -R "$(whoami)" web/.next`.

## UI and theming rules

1. **Reuse `web/src/components/ui`:** Build screens from the existing kit (`Button`, `ButtonWithTooltip`, `Dialog`, `Field`, `TextField`, `NumericField`, `CurrencyField`, `TextareaField`, `SelectField`, `MultiSelectField`, `RadioField`, `DropdownMenu` / `Menu`, `Card`, `Tooltip`, …). Import from `@/components/ui` (see [UI component structure](#ui-component-structure)). Only add a new primitive in `ui/` when something is genuinely missing; do not duplicate buttons, inputs, or modals ad hoc in feature folders. **New or changed primitives:** update the [showcase page](#showcase-page).
2. **Styling:** Do not hardcode one-off hex colors for core UI unless the task requires it. Use Mocha tokens (`text-text`, `bg-surface-0`, `border-border`, …) or roles (`primary`, `secondary`, `foreground`, `muted`). Use `cn()` from `@/lib/utils` to merge Tailwind classes.
3. **Tailwind v4:** Add new CSS variables under `:root` and map them in `@theme inline` in `globals.css`.
4. **CSS variables in utilities (canonical classes):** This project uses Tailwind v4’s **parentheses shorthand** for `var(...)`. **Do not** write `px-[var(--page-padding-x)]` or `min-w-[var(--radix-select-trigger-width)]`. **Do** write `px-(--page-padding-x)`, `w-(--radix-popover-trigger-width)`, `min-w-(--radix-select-trigger-width)`, etc. For expressions (e.g. `min()` with several arguments), use the same form: `max-h-(min(24rem,var(--radix-select-content-available-height)))`. Use square-bracket arbitrary values `[...]` only when this syntax cannot express the value. This avoids ESLint **`suggestCanonicalClasses`** noise and matches the [Tailwind v4 arbitrary value](https://tailwindcss.com/docs/adding-custom-styles) conventions.
5. **Theme:** The app is **Catppuccin Mocha** (dark). `html` uses **crust** as the outer shell; `body` uses **base** as the main background. A light theme (e.g. Latte) can be added later by extending `:root` or a class on `<html>`.
6. **Logos:** Round / long / short brand assets under `web/public/brand/`. Do not remove without replacing usages.
7. **Forms:** Prefer `*Field` components for labeled controls with errors; use `inputClassName` when styling the inner control and `className` on the field for the outer wrapper. `TooltipProvider` wraps the app in `layout.tsx` for `ButtonWithTooltip` / `Tooltip`.
8. **Icons:** Put static `.svg` / `.png` (and similar) under **`web/public/icons/`**; put shared inline-SVG React icons under **`web/src/components/icons/`**. See [Icons](#icons).
9. **Server vs client:** Prefer Server Components for routes and non-interactive UI; keep client boundaries small. See [React Server Components](#react-server-components-default).

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

- Add new SQL files as `api/migrations/00x_description.sql` (lexicographic order).
- The **Go API** records each filename in **`schema_migrations`** (same as the historical shell runner). Do not rename applied files without a deliberate migration strategy.
- Keep Postgres-specific SQL portable enough for your deployment target; avoid app-only logic in SQL unless necessary.

## Docker notes

- Compose order: **`postgres`** (healthy) → **`api`** (runs SQL migrations then **`GET /health`**) → **`web`** / **`test`**. See **`deploy/*.yml`** and **`api/deploy/Dockerfile.*`**.
- **API images:** **`Dockerfile.prod`** — multi-stage release binary + **`/migrations`**. **`Dockerfile.dev`** — **Air** (`api/.air.toml`); dev Compose bind-mounts **`api/`** → **`/src`**. **`Dockerfile.test`** — **`gotestsum`** → **`junit.xml`**; **`test-summary/action`** reads **`api/junit.xml`** in CI. Integration tests need the host **`docker.sock`** — **`docker compose -f deploy/docker-compose.test.yml --profile go-tests run --rm api-go-tests`**.
- **Web test image:** **`web/deploy/Dockerfile.test`** — **`lint:junit`** (**`eslint-junit.xml`**) + **`next build`**; Compose profile **`web-tests`** bind-mounts **`web/`** (named volume for **`node_modules`**). CI: **`test-summary/action`** on **`web/eslint-junit.xml`**. Run **`docker compose -f deploy/docker-compose.test.yml --profile web-tests run --rm web-test`** (starts **`postgres`** + **`api`**; set **`JWT_SECRET`** for **`api`**). Default **`docker compose … up`** on the test file starts **`postgres`** + **`api`** only unless you add **`--profile web-tests`**.
- **Build context:** Each service image is built from its app tree only — **`api/`** for the Go API, **`web/`** for Next — no monorepo-root `COPY`. See **`api/.dockerignore`** and **`web/.dockerignore`**. Dev Compose bind-mounts **`web/`** → **`/app/web`** and **`api/`** → **`/src`** for hot reload, not for build context.
- Production Next image uses `output: "standalone"` in **`web/next.config.ts`**.

## What not to do

- Do not commit secrets or real `.env` files.
- Do not **`git commit`** on the user’s behalf unless they explicitly ask you to; see [Agent workflow](#agent-workflow-cursor--automation).
- Do not introduce large refactors unrelated to the task; match existing patterns and file layout.
- Do not add `web/src/components/auth/` (or other top-level domain folders next to `hooks/` / `icons/` / `ui/`); place auth-related UI under `web/src/components/ui/forms/`, `common/`, or `layout/` per [UI component structure](#ui-component-structure).
- Do not edit `.pen` design files with plain text tools; use the Pencil MCP tooling if those assets exist.

## When in doubt

Prefer small, reviewable changes; one feature per branch; semantic theme tokens; typed server boundaries where data crosses the DB or API.
