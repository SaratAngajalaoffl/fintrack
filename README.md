<p align="center">
  <img src="web/public/brand/round_logo.png" width="96" height="96" alt="Fintrack logo" />
</p>

<h1 align="center">
  <img src="web/public/brand/long_logo.png" alt="Fintrack" width="360" />
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

## Stack

- **Frontend:** [Next.js](https://nextjs.org/) (App Router) in **`web/`**, React, TypeScript, Tailwind CSS
- **API (growing):** [Go](https://go.dev/) in **`api/`** — see [api/README.md](api/README.md)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with SQL migrations in **`migrations/`** (repo root)
- **Deployment:** Docker images and Compose files in **`deploy/`** for dev, test, and production-style runs

This repository is a **simple monorepo** (no npm workspaces): install Node dependencies inside **`web/`** and run Go commands inside **`api/`**.

## Requirements

| Tool                        | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| **Node.js** (LTS)           | Local development and production Node build (`web/`)      |
| **npm**                     | Install dependencies and run scripts under `web/`         |
| **Go** (1.22+)              | Build and run the `api/` service                          |
| **Docker & Docker Compose** | Optional; recommended for Postgres + app with one command |

## Quick start (local development)

1. **Clone** this repository.

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

   This repo keeps hooks under **`.githooks/`** (e.g. **`pre-commit`** runs **`lint-staged`** using **`web/package.json`**). Run the command once per clone.

3. **Environment**

   Copy the example env file at the **repository root** (used by Docker Compose):

   ```bash
   cp .env.example .env
   ```

   For Next.js running **on your host** (not in Docker), create **`web/.env`** with the same values you need (at minimum `DATABASE_URL` and `JWT_SECRET` where applicable — see `.env.example` comments). Next.js loads env files from **`web/`** when you run scripts there.

   Example for local Postgres:

   ```bash
   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DATABASE
   ```

4. **Database:** Ensure PostgreSQL is running and migrations have been applied (see [Database migrations](#database-migrations)).

5. **Start the dev server:**

   ```bash
   cd web
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

Optional — **Go API** (minimal health server):

```bash
cd api
go run ./cmd/fintrack
```

`GET http://localhost:8080/health` returns `{"status":"ok"}`.

## Run with Docker Compose (web app + Postgres)

This runs the Next.js app from **`web/`**, applies migrations, and starts Postgres using the **development** compose file.

1. Copy and adjust environment variables at the **repository root** (optional; defaults work for local tries):

   ```bash
   cp .env.example .env
   ```

2. From the **repository root**, run:

   ```bash
   docker compose -f deploy/compose/docker-compose.dev.yml up --build
   ```

3. The app is available at [http://localhost:3000](http://localhost:3000) (or the host port you set with `WEB_PORT`).

`DATABASE_URL` is set inside Compose for the `web` service; you usually do not need to change it for this stack.

### Other Compose profiles

| File                                     | Purpose                                         |
| ---------------------------------------- | ----------------------------------------------- |
| `deploy/compose/docker-compose.dev.yml`  | Development: hot reload, source bind-mount      |
| `deploy/compose/docker-compose.test.yml` | Lint + production build after migrations        |
| `deploy/compose/docker-compose.prod.yml` | Production-style image (`output: "standalone"`) |

Examples:

```bash
# Production-style build and run
docker compose -f deploy/compose/docker-compose.prod.yml up --build -d

# CI-style checks (lint + build) with Postgres + migrations
docker compose -f deploy/compose/docker-compose.test.yml up --build
```

Avoid `docker compose up --abort-on-container-exit` with these files: the one-shot migration service can interact badly with that flag.

## Database migrations

SQL files live in **`migrations/`**. When using Docker Compose, a **`migrate`** service runs before the app and applies any new migration files (tracked in `schema_migrations`).

If you run Postgres yourself, apply the same files in order with `psql` or your preferred migration workflow.

## Scripts

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

Contributions are welcome. Please read **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** for guidelines, and **[docs/README.md](docs/README.md)** for a small documentation index.

## Acknowledgements

Fintrack is built on top of excellent open source software and community work. Special thanks to the teams and maintainers behind [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [PostgreSQL](https://www.postgresql.org/), and [Docker](https://www.docker.com/) for the tools that make this project possible.

## License

Fintrack is released under the **[MIT License](LICENSE)**.
