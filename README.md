<p align="center">
  <img src="assets/brand/round_logo.png" width="96" height="96" alt="Fintrack logo" />
</p>

<h1 align="center">
  <img src="assets/brand/long_logo.png" alt="Fintrack" width="360" />
</h1>

<p align="center">
  <strong>Personal finance tracking you can run yourself.</strong>
</p>

<p align="center">
  Fintrack is a free, open source web application for managing your money. Self-host it on your own hardware or cloud account—your data stays under your control.
</p>

---

## Features (roadmap)

Fintrack is under active development. The goal is a responsive app for balances, categories, transactions, and clarity—without locking you into a proprietary service.

## Repositories

This **meta-repository** wires the app together; application code lives in two **Git submodules**:

| Path / repo | Stack | Remote |
| ----------- | ----- | ------ |
| **`web/`** | [Next.js](https://nextjs.org/) (App Router), React, TypeScript, Tailwind CSS | [fintrack-web](https://github.com/SaratAngajalaoffl/fintrack-web) |
| **`api/`** | [Go](https://go.dev/) HTTP API, PostgreSQL migrations | [fintrack-api](https://github.com/SaratAngajalaoffl/fintrack-api) |

- **Clone with submodules:** `git clone --recurse-submodules https://github.com/SaratAngajalaoffl/fintrack.git`
- **Existing clone:** `git submodule update --init --recursive`

Shared **Docker Compose** files live under **`deploy/`** (build contexts **`../web`** and **`../api`** relative to `deploy/`). Documentation index: **[docs/README.md](docs/README.md)**.

## Stack (summary)

- **Frontend:** Next.js in **`web/`** — see [web/README.md](web/README.md)
- **API:** Go in **`api/`** — see [api/README.md](api/README.md)
- **Database:** PostgreSQL; SQL migrations in **`api/migrations/`** (submodule)
- **Deployment:** Dockerfiles under **`api/deploy/`** and **`web/deploy/`**; Compose stacks in **`deploy/`** for dev, test, and production-style runs

## Requirements

| Tool                        | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| **Node.js** (LTS)           | Local development and production Node build (`web/`)      |
| **npm**                     | Install dependencies and run scripts under `web/`         |
| **Go** (see `api/go.mod`)   | Build and run the `api/` service                          |
| **Docker & Docker Compose** | Optional; recommended for Postgres + app with one command |
| **Git**                     | Submodule support (`git submodule`) for `web/` and `api/` |

## Quick start (local development)

1. **Clone** this repository **with submodules** (see [Repositories](#repositories)).

2. **Install dependencies**

   **Frontend** (required):

   ```bash
   cd web
   npm install
   ```

   **Git hooks** (optional — native hooks via `core.hooksPath`, [documented](https://git-scm.com/docs/git-config#Documentation/git-config.txt-corehooksPath) in Git):

   ```bash
   git config core.hooksPath .githooks
   ```

   From the **meta-repo root**, **`.githooks/`** (e.g. **`pre-commit`** → **`lint-staged`** using **`web/package.json`**). Run once per clone.

3. **Environment**

   Copy the per-app examples inside each submodule and adjust values:

   ```bash
   cp api/.env.example api/.env
   cp web/.env.example web/.env.local
   ```

   Set **`JWT_SECRET`** (≥16 characters) only in **`api/.env`** — the Go API signs session cookies. In **`web/.env.local`**, set **`API_ORIGIN`** so Next rewrites can forward same-origin **`/api/*`** requests to the Go API for **`GET /api/auth/me`** (middleware and server components). See **`api/.env.example`** and **`web/.env.example`** for **`DATABASE_URL`**, **`CORS_ALLOWED_ORIGINS`**, and optional variables.

   **Docker Compose:** when you run Compose from this **repository root**, you can add a **root** `.env` (not committed) with **`POSTGRES_*`** and port overrides — or export those variables. Example:

   ```bash
   POSTGRES_USER=fintrack
   POSTGRES_PASSWORD=fintrack
   POSTGRES_DB=fintrack
   POSTGRES_PORT=5432
   WEB_PORT=3000
   API_PORT=8000
   ```

4. **Database:** Ensure PostgreSQL is running and migrations have been applied (see [Database migrations](#database-migrations)).

5. **Start the dev server:**

   ```bash
   cd web
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

**Go API** (auth + migrations + health): from **`api/`**, set **`DATABASE_URL`** and **`JWT_SECRET`** (≥16 chars), then:

```bash
cd api
go run ./cmd/api
```

**`getApiRoute()`** (see **`web/src/configs/api-routes.ts`**) always builds same-origin **`/api/*`** URLs. Next rewrites forward them using **`API_ORIGIN`** (for Docker, typically **`http://api:8080`**).

`GET http://localhost:8080/health` returns `{"status":"ok"}`.

## Run with Docker Compose (Postgres + Go API + Next.js)

This starts **Postgres**, the **Go API** (which applies **`api/migrations/`** SQL on startup, then serves **`GET /health`** on port **8000** by default in this file), and the Next.js app from **`web/`**, using the **development** compose file.

1. Copy **`api/.env.example`** → **`api/.env`** and **`web/.env.example`** → **`web/.env`** (set **`JWT_SECRET`** in **`api/.env`** only; set **`API_ORIGIN`** for how Next reaches the API). Optionally create a **root** `.env` with **`POSTGRES_*`** / **`WEB_PORT`** / **`API_PORT`** for Compose interpolation (defaults work for local tries).

2. From the **repository root**, run:

   ```bash
   docker compose -f deploy/docker-compose.dev.yml up --build
   ```

3. **Web:** [http://localhost:3000](http://localhost:3000) (or `WEB_PORT`). **API:** [http://localhost:8000/health](http://localhost:8000/health) (or `API_PORT`; production-style compose uses **8080**).

`DATABASE_URL` is set for **`api`** and **`web`** inside Compose; defaults are usually fine for local use.

### Other Compose profiles

| File                             | Purpose                                                                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `deploy/docker-compose.dev.yml`  | Development: hot reload, source bind-mount                                                                                                    |
| `deploy/docker-compose.test.yml` | **`postgres`** + **`api`** by default; **`--profile web-tests`** (ESLint JUnit + Next build) or **`--profile go-tests`** (Go **`gotestsum`**) |
| `deploy/docker-compose.prod.yml` | Production-style image (`output: "standalone"`)                                                                                               |

Examples:

```bash
# Production-style build and run
docker compose -f deploy/docker-compose.prod.yml up --build -d

# CI-style web checks (ESLint JUnit + build) — needs JWT_SECRET for api (export or .env)
docker compose -f deploy/docker-compose.test.yml --profile web-tests run --rm web-test

# Go tests (testcontainers; host Docker socket)
docker compose -f deploy/docker-compose.test.yml --profile go-tests run --rm api-go-tests
```

## Database migrations

SQL files live in **`api/migrations/`** (inside the **api** submodule). The **Go API** applies pending files on startup (filenames recorded in **`schema_migrations`**). Run **`go run ./cmd/api`** from **`api/`** so migrations resolve correctly; Docker images mount or copy SQL into **`/migrations`**.

If you run Postgres yourself, apply the same files in order with `psql` or your preferred migration workflow. **Seeding** is not run by the API — use your own scripts (see **`data/`**).

## Scripts (frontend)

Run these from **`web/`** (after `cd web`):

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Next.js development server   |
| `npm run build`        | Production build             |
| `npm run start`        | Run production build locally |
| `npm run lint`         | ESLint                       |
| `npm run format`       | Prettier (write)             |
| `npm run format:check` | Prettier (check only)        |

With **`core.hooksPath`** set to **`.githooks`**, **`pre-commit`** runs **Prettier** and **ESLint** on staged files via **`lint-staged`** (see **`web/package.json`**).

## Contributing

Contributions are welcome. Read **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** for clone setup, which repository to target for PRs, and **[docs/README.md](docs/README.md)** for the documentation index.

## Acknowledgements

Fintrack is built on top of excellent open source software and community work. Special thanks to the teams and maintainers behind [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [PostgreSQL](https://www.postgresql.org/), and [Docker](https://www.docker.com/) for the tools that make this project possible.

## License

Fintrack is released under the **[MIT License](LICENSE)**.
