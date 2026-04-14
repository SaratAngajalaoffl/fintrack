# Monorepo migration: Go API + Next.js frontend

This document tracks the move from **Next.js Route Handlers** (`web/src/app/api/**`) to a dedicated **Go** HTTP API in **`api/`**, while keeping **Next.js** in **`web/`** focused on UI, SSR, and calling the API from the browser and server.

**Status:** layout landed (`web/` + `api/` at repo root; **no npm workspaces**). Former Next Route Handlers for **`/api/*`** app domains have been **replaced by the Go API**. **`getApiRoute()`** builds absolute URLs using **`NEXT_PUBLIC_API_ORIGIN`** (and CORS on the API for cross-origin **`fetch`**).

## Goals

- **Clear boundaries:** Go owns HTTP + persistence orchestration for app domains; Next.js owns routing, components, and data fetching (React Query, Server Components where appropriate).
- **Single database:** PostgreSQL remains the source of truth; ordered SQL lives in **`api/migrations/`** (applied by the Go API on startup in each environment).
- **Incremental cutover:** avoid a “big bang” rewrite; migrate route groups or domains one at a time.

## Repository layout (current)

| Path | Role |
| ---- | ---- |
| **`web/`** | Next.js app — `package.json`, **`web/src/`**, **`web/public/`**. Install with **`cd web && npm install`**. |
| **`api/`** | Go module — **`api/go.mod`**, **`api/cmd/api/`**. Run with **`cd api && go run ./cmd/api`**. |
| **`api/migrations/`** | SQL migrations (Go API applies on startup). |
| **`deploy/`** | Docker Compose and Dockerfiles — **`web/`** (Next), **`api/`** (Go, see **`deploy/docker/Dockerfile.api`**). |

There is **no** root `package.json` and **no** npm/pnpm workspaces: treat **`web/`** and **`api/`** as two independent projects sharing one git repository.

## API inventory (Go service + `getApiRoute`)

Paths are defined in **`web/src/configs/api-routes.ts`** and implemented in **`api/`**. **`getApiRoute()`** returns **`${getApiOrigin()}${path}`**; configure **`NEXT_PUBLIC_API_ORIGIN`** for the browser (see **`web/.env.example`**). The Go API sends CORS headers for allowed origins (see **`CORS_ALLOWED_ORIGINS`** in **`api/`**).

| Area | Routes |
| ---- | ------ |
| **Auth** | **`/api/auth/*`** — signup, login, logout, me, account-data, forgot/reset password, change-password + request-otp. |
| **Bank accounts** | **`/api/bank-accounts`**, **`/api/bank-accounts/:id`**. |
| **Credit cards** | **`/api/credit-cards`**, **`/api/credit-cards/:id`** (`GET`/`PATCH`/`DELETE`). |
| **Fund buckets** | **`/api/fund-buckets`**, **`/api/fund-buckets/:id/allocate`**, **`unlock`**, **`priority`**. |
| **Expense categories** | **`/api/expense-categories`**, **`/api/expense-categories/:id`**. |

## Phased implementation

Complete phases in order unless noted. Mark checkboxes in a PR when a phase is done.

### Phase 0 — Alignment (documentation)

- [x] Record goals, layout, and route inventory in this file.
- [x] Folder layout: **`web/`** + **`api/`** at repo root; **no npm workspaces**.

### Phase 1 — Repository skeleton

- [x] **Go module** at **`api/`** with **`GET /health`**, **`internal/`** layout, and startup **SQL migrations** in **`api/migrations/`**. See **[api/README.md](../api/README.md)**.
- [x] **Logging & HTTP:** structured logs (`slog`), graceful shutdown, **`DATABASE_URL`** (migrations path auto-resolved; optional **`MIGRATIONS_PATH`** override).
- [x] **Docker / Compose:** **`api`** service (**`deploy/docker/Dockerfile.api`**), **`postgres` → `api` → `web`**. No separate **`migrate`** container.
- [x] **Developer workflow:** run Next from **`web/`** and the API from **`api/`** (two terminals), documented in root **README** and **AGENTS.md**.

### Phase 2 — Client integration contract

- [x] **Auth** and all app domains: same **`/api/...`** paths; **`getApiRoute()`** + **`NEXT_PUBLIC_API_ORIGIN`**. **`JWT_SECRET`** must match between **`api`** and **`web`** (middleware).
- [x] **Client:** `web/src/services/*/*-api.ts` — unchanged paths; **`credentials: "include"`** for session cookies.
- [x] Keep **`web/src/configs/api-routes.ts`** as the **path** registry.

### Phase 3 — Strangler: migrate one vertical slice

- [x] Domains migrated to Go; **`getApiRoute()`** + **`NEXT_PUBLIC_API_ORIGIN`** + API CORS.

### Phase 4 — Domain-by-domain migration

- [x] **Credit cards**, **fund buckets**, **bank accounts**, **expense categories**, **auth** — Go + **`getApiRoute`** (see Phase 2).

### Phase 5 — Cleanup

- [x] Removed **`web/src/app/api/**`** Route Handlers for migrated domains (tree may be empty or absent).
- [ ] Update deployment docs: two artifacts (Go binary + Next standalone build) or unified Compose.
- [ ] CI: `go test ./...` from **`api/`**, `npm run lint` / `npm run build` from **`web/`**.

## Open decisions (track here)

| Topic | Options | Decision |
| ----- | ------- | -------- |
| Workspace layout | ~~`apps/*`~~ vs **`web/` + `api/`** | **`web/` + `api/`** (no npm workspaces) |
| API path prefix | Same `/api/...` as today vs `/v1/...` | _TBD_ |
| Same-origin in prod | Reverse proxy (Caddy/Nginx) vs CORS from browser | _TBD_ |
| Session transport | HTTP-only cookies (BFF) vs tokens | **HTTP-only cookie** **`fintrack_session`** set by Go; client calls use **`fetch(getApiRoute(...), { credentials: 'include' })`**. If browser and API origins differ, configure CORS + cookie settings accordingly. |

## Related docs

- [Agent guide](../AGENTS.md) — repo conventions; look for **Monorepo migration**.
- [Routes](routes.md) — app and API route registry pattern.
- [Data model](data-model.md) — DB tables; Go handlers should stay consistent with migrations.
