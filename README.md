<p align="center">
  <img src="public/brand/round_logo.png" width="96" height="96" alt="Fintrack logo" />
</p>

<h1 align="center">
  <img src="public/brand/long_logo.png" alt="Fintrack" width="360" />
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

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), React, TypeScript, Tailwind CSS
- **Database:** [PostgreSQL](https://www.postgresql.org/) with SQL migrations in `migrations/`
- **Deployment:** Docker images and Compose files in `deploy/` for dev, test, and production-style runs

## Requirements

| Tool                        | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| **Node.js** (LTS)           | Local development and production Node build               |
| **npm**                     | Install dependencies and run scripts                      |
| **Docker & Docker Compose** | Optional; recommended for Postgres + app with one command |

## Quick start (local development)

1. **Clone** this repository.

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment:** Copy the example env file and edit if needed:

   ```bash
   cp .env.example .env
   ```

   For Next.js running **on your host** (not in Docker), set `DATABASE_URL` in `.env` to point at your Postgres instance, for example:

   ```bash
   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DATABASE
   ```

4. **Database:** Ensure PostgreSQL is running and migrations have been applied (see [Database migrations](#database-migrations)).

5. **Start the dev server:**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Run with Docker Compose (app + Postgres)

This runs the web app, applies migrations, and starts Postgres using the **development** compose file.

1. Copy and adjust environment variables (optional; defaults work for local tries):

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

SQL files live in `migrations/`. When using Docker Compose, a **`migrate`** service runs before the app and applies any new migration files (tracked in `schema_migrations`).

If you run Postgres yourself, apply the same files in order with `psql` or your preferred migration workflow.

## Scripts

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Next.js development server   |
| `npm run build`        | Production build             |
| `npm run start`        | Run production build locally |
| `npm run lint`         | ESLint                       |
| `npm run format`       | Prettier (write)             |
| `npm run format:check` | Prettier (check only)        |

Git hooks (via Husky) run **Prettier** and **ESLint** on staged files before each commit.

## Contributing

Contributions are welcome. Please read **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** for guidelines, and **[docs/README.md](docs/README.md)** for a small documentation index.

## License

Fintrack is released under the **[MIT License](LICENSE)**.
