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
| **`api/`** | Go module — **`api/go.mod`**, **`api/cmd/fintrack/`**. Run with **`cd api && go run ./cmd/fintrack`**. |
| **`migrations/`** | SQL migrations (shared). |
| **`deploy/`** | Docker Compose and Dockerfiles (Next builds from **`web/`**); extend with an **`api`** service when ready. |

There is **no** root `package.json` and **no** npm/pnpm workspaces: treat **`web/`** and **`api/`** as two independent projects sharing one git repository.

## Current API inventory (Next.js Route Handlers)

These paths are implemented under **`web/src/app/api/`** and mirrored in **`web/src/configs/api-routes.ts`**. Until a phase replaces them, this is the source of truth for paths and methods.

| Area | Routes |
| ---- | ------ |
| **Auth** | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `GET /api/auth/account-data`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/change-password/request-otp`, `POST /api/auth/change-password` |
| **Bank accounts** | `GET`/`POST /api/bank-accounts`, `GET`/`PATCH`/`DELETE /api/bank-accounts/[accountId]` |
| **Credit cards** | `GET`/`POST /api/credit-cards`, `GET`/`PATCH`/`DELETE /api/credit-cards/[cardId]` |
| **Fund buckets** | `GET`/`POST /api/fund-buckets`, `POST .../allocate`, `POST .../unlock`, `PATCH .../priority` |
| **Expense categories** | `GET`/`POST /api/expense-categories`, `GET`/`PATCH`/`DELETE /api/expense-categories/[categoryId]` |

## Phased implementation

Complete phases in order unless noted. Mark checkboxes in a PR when a phase is done.

### Phase 0 — Alignment (documentation)

- [x] Record goals, layout, and route inventory in this file.
- [x] Folder layout: **`web/`** + **`api/`** at repo root; **no npm workspaces**.

### Phase 1 — Repository skeleton

- [x] **Go module** at **`api/`** with minimal **`GET /health`** (see **[api/README.md](../api/README.md)**).
- [ ] Structured logging, graceful shutdown; optional **`DATABASE_URL`** wiring when DB access is added.
- [ ] **Docker / Compose:** optional **`api`** service building the Go binary; document ports in **`deploy/compose/*.yml`** when introduced.
- [x] **Developer workflow:** run Next from **`web/`** and the API from **`api/`** (two terminals), documented in root **README** and **AGENTS.md**.

### Phase 2 — Client integration contract

- [ ] **Base URL:** a single env-driven base for browser and server fetches (e.g. `NEXT_PUBLIC_API_BASE_URL` for client-side; server may use internal URL in Docker).
- [ ] Update **`web/src/services/`** (and any Server Component fetches) to use that base when calling the Go API — starting with **no** production traffic to Go until routes exist.
- [ ] Keep **`web/src/configs/api-routes.ts`** as the **path** registry; either paths stay identical (`/api/...` on the Go server behind a reverse proxy) or you version once (e.g. `/v1/...`) and update the helper in one place.

### Phase 3 — Strangler: migrate one vertical slice

- [ ] Implement the first domain in Go (recommend starting with **read-heavy** or **small** surface area, e.g. expense categories or a read-only endpoint).
- [ ] Point the frontend for **only that slice** at the Go service (directly in dev, or via proxy in Next `rewrites` if you need same-origin cookies — **decide cookie/session strategy** before moving auth).
- [ ] Deprecate or remove the corresponding Next Route Handlers once parity is verified (tests or manual checklist).

### Phase 4 — Domain-by-domain migration

- [ ] Repeat for **bank accounts**, **credit cards**, **fund buckets**, and remaining **auth** routes.
- [ ] **Auth last or with extra care:** session cookies, CSRF, and OTP flows often need explicit design so behavior matches the current Next implementation.

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
| Session transport | HTTP-only cookies (BFF pattern) vs tokens | _TBD_ — align with current **`web/src/app/api/auth/`** behavior |

## Related docs

- [Agent guide](../AGENTS.md) — repo conventions; look for **Monorepo migration**.
- [Routes](routes.md) — app and API route registry pattern.
- [Data model](data-model.md) — DB tables; Go handlers should stay consistent with migrations.
