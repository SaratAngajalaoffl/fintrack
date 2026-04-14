# Monorepo migration: Go API + Next.js frontend

This document tracks the move from **Next.js Route Handlers** (`web/src/app/api/**`) to a dedicated **Go** HTTP API in **`api/`**, while keeping **Next.js** in **`web/`** focused on UI, SSR, and calling the API from the browser and server.

**Status:** layout landed (`web/` + `api/` at repo root; **no npm workspaces**). Remaining work: implement domains in Go and cut over from Route Handlers incrementally.

## Goals

- **Clear boundaries:** Go owns HTTP + persistence orchestration for app domains; Next.js owns routing, components, and data fetching (React Query, Server Components where appropriate).
- **Single database:** PostgreSQL remains the source of truth; **`migrations/`** stays at the repo root (one schema, consumed by whichever service runs migrations in each environment).
- **Incremental cutover:** avoid a “big bang” rewrite; migrate route groups or domains one at a time.

## Repository layout (current)

| Path | Role |
| ---- | ---- |
| **`web/`** | Next.js app — `package.json`, **`web/src/`**, **`web/public/`**. Install with **`cd web && npm install`**. |
| **`api/`** | Go module — **`api/go.mod`**, **`api/cmd/api/`**. Run with **`cd api && go run ./cmd/api`**. |
| **`migrations/`** | SQL migrations (shared). |
| **`deploy/`** | Docker Compose and Dockerfiles — **`web/`** (Next), **`api/`** (Go, see **`deploy/docker/Dockerfile.api`**). |

There is **no** root `package.json` and **no** npm/pnpm workspaces: treat **`web/`** and **`api/`** as two independent projects sharing one git repository.

## Current API inventory (Next.js Route Handlers)

These paths are implemented under **`web/src/app/api/`** and mirrored in **`web/src/configs/api-routes.ts`**. Until a phase replaces them, this is the source of truth for paths and methods.

| Area | Routes |
| ---- | ------ |
| **Auth** | Implemented in **Go** (`api/`). Next.js rewrites **`/api/auth/*`** via **`API_ORIGIN`**. Paths unchanged: signup, login, logout, me, account-data, forgot/reset password, change-password + request-otp. |
| **Bank accounts** | Implemented in **Go**. Next rewrites **`/api/bank-accounts`** (see **`API_ORIGIN`**). Same paths as before. |
| **Credit cards** | `GET`/`POST /api/credit-cards`, `GET`/`PATCH`/`DELETE /api/credit-cards/[cardId]` |
| **Fund buckets** | `GET`/`POST /api/fund-buckets`, `POST .../allocate`, `POST .../unlock`, `PATCH .../priority` |
| **Expense categories** | `GET`/`POST /api/expense-categories`, `GET`/`PATCH`/`DELETE /api/expense-categories/[categoryId]` |

## Phased implementation

Complete phases in order unless noted. Mark checkboxes in a PR when a phase is done.

### Phase 0 — Alignment (documentation)

- [x] Record goals, layout, and route inventory in this file.
- [x] Folder layout: **`web/`** + **`api/`** at repo root; **no npm workspaces**.

### Phase 1 — Repository skeleton

- [x] **Go module** at **`api/`** with **`GET /health`**, **`internal/`** layout, and startup **SQL migrations** (same files as **`migrations/`** at repo root). See **[api/README.md](../api/README.md)**.
- [x] **Logging & HTTP:** structured logs (`slog`), graceful shutdown, **`DATABASE_URL`** + **`MIGRATIONS_PATH`**.
- [x] **Docker / Compose:** **`api`** service (**`deploy/docker/Dockerfile.api`**), **`postgres` → `api` → `web`**. No separate **`migrate`** container.
- [x] **Developer workflow:** run Next from **`web/`** and the API from **`api/`** (two terminals), documented in root **README** and **AGENTS.md**.

### Phase 2 — Client integration contract

- [x] **Auth:** same paths **`/api/auth/*`**; Next **`rewrites`** to **`API_ORIGIN`** (Go). **`JWT_SECRET`** must match between **`api`** and **`web`** (middleware).
- [x] **Bank accounts:** same paths **`/api/bank-accounts`**; rewrites on **`web`** (plus **`JWT_SECRET`** for session on protected routes).
- [ ] **Other domains:** optional **`NEXT_PUBLIC_API_BASE_URL`** (or keep rewrites) when moving remaining APIs; update **`web/src/services/`** as each domain lands in Go.
- [x] Keep **`web/src/configs/api-routes.ts`** as the **path** registry (paths unchanged for auth).

### Phase 3 — Strangler: migrate one vertical slice

- [ ] Implement the first domain in Go (recommend starting with **read-heavy** or **small** surface area, e.g. expense categories or a read-only endpoint).
- [ ] Point the frontend for **only that slice** at the Go service (directly in dev, or via proxy in Next `rewrites` for same-origin cookies — **auth** already uses this pattern).
- [ ] Deprecate or remove the corresponding Next Route Handlers once parity is verified (tests or manual checklist).

### Phase 4 — Domain-by-domain migration

- [ ] Repeat for **bank accounts**, **credit cards**, **fund buckets**, and other non-auth APIs.
- [x] **Auth** — implemented in Go; session cookie + rewrites + shared **`JWT_SECRET`** (see Phase 2).

### Phase 5 — Cleanup

- [ ] Remove unused **`web/src/app/api/**`** files once every route has a Go equivalent and the frontend no longer depends on Next handlers.
- [ ] Update deployment docs: two artifacts (Go binary + Next standalone build) or unified Compose.
- [ ] CI: `go test ./...` from **`api/`**, `npm run lint` / `npm run build` from **`web/`**.

## Open decisions (track here)

| Topic | Options | Decision |
| ----- | ------- | -------- |
| Workspace layout | ~~`apps/*`~~ vs **`web/` + `api/`** | **`web/` + `api/`** (no npm workspaces) |
| API path prefix | Same `/api/...` as today vs `/v1/...` | _TBD_ |
| Same-origin in prod | Reverse proxy (Caddy/Nginx) vs CORS from browser | _TBD_ |
| Session transport | HTTP-only cookies (BFF) vs tokens | **HTTP-only cookie** **`fintrack_session`** set by Go; browser calls same-origin **`/api/auth/*`** (Next rewrites to **`API_ORIGIN`**) so **`middleware.ts`** can verify JWT. |

## Related docs

- [Agent guide](../AGENTS.md) — repo conventions; look for **Monorepo migration**.
- [Routes](routes.md) — app and API route registry pattern.
- [Data model](data-model.md) — DB tables; Go handlers should stay consistent with migrations.
