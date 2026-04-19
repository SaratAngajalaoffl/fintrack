# Contributing to Fintrack

Thank you for your interest in Fintrack. This project is open source and welcomes contributions from the community.

Fintrack is split across **three Git repositories**:

| Repository | Role |
| ---------- | ---- |
| **[fintrack](https://github.com/SaratAngajalaoffl/fintrack)** (meta) | Docker Compose under `deploy/`, shared `docs/`, `AGENTS.md`, `.githooks/`, submodule pointers |
| **[fintrack-web](https://github.com/SaratAngajalaoffl/fintrack-web)** | Next.js frontend (`src/`, `package.json`, …) |
| **[fintrack-api](https://github.com/SaratAngajalaoffl/fintrack-api)** | Go HTTP API and SQL `migrations/` |

Open pull requests on the repository that contains your change (UI → **web**, API or SQL → **api**, Compose or top-level docs → **meta**). Full-stack features often need coordinated PRs in two or three repos; note cross-links in descriptions.

## Ways to contribute

- **Report bugs** — Open an issue on the relevant repository with steps to reproduce, expected behavior, and your environment (OS, Node or Go version, how you run the app).
- **Suggest features** — Open an issue to discuss ideas before large changes.
- **Submit pull requests** — Fix bugs, improve docs, or add features. For non-trivial changes, an issue first is appreciated.

## Development setup

1. **Requirements:** [Node.js](https://nodejs.org/) (LTS) and [npm](https://www.npmjs.com/) for the web app; [Go](https://go.dev/) matching **`api/go.mod`** for the API; optionally [Docker](https://www.docker.com/) with Docker Compose for Postgres + both services.

2. **Clone the meta-repository with submodules** (recommended full stack):

   ```bash
   git clone --recurse-submodules https://github.com/SaratAngajalaoffl/fintrack.git
   cd fintrack
   ```

   If you already cloned without submodules:

   ```bash
   git submodule update --init --recursive
   ```

3. **Install frontend dependencies** from the **`web/`** submodule (this project does not use npm workspaces at the meta root):

   ```bash
   cd web
   npm install
   ```

   Optional — enable **pre-commit** (Prettier + ESLint via **`lint-staged`**): from the **meta-repo** root, run **`git config core.hooksPath .githooks`** once per clone. Hooks live under **`.githooks/`** in the meta-repo.

4. **Environment:** Copy **`api/.env.example`** → **`api/.env`** and **`web/.env.example`** → **`web/.env.local`** (or **`web/.env`**). For Docker Compose, optionally add a **meta-repo root** `.env` with **`POSTGRES_*`** and ports (see the [README](../README.md)).

5. **Run** the Next dev server from **`web/`** (`npm run dev`). Run the Go API from **`api/`** when you need auth or domain endpoints (see **`api/README.md`**).

After changes, run formatting and lint locally (the same checks may run on commit via git hooks):

```bash
cd web
npm run format
npm run lint
```

For Go changes: **`cd api && make test`** (integration tests need Docker).

## Pull request guidelines

- Keep changes **focused** — one logical change per PR when possible.
- **Describe** what changed and why in the PR description.
- Ensure **lint passes** and the app **builds** (`cd web && npm run build`) for non-trivial UI or config changes.
- Match existing **style and patterns** in the codebase.

For deeper conventions (structure, theming, Docker, migrations), see [AGENTS.md](../AGENTS.md) in the meta-repository.

## Code of conduct

Be respectful and constructive in issues and pull requests. Assume good intent; disagree on technical details without personal attacks.

---

Questions are welcome in issues or discussions (if enabled on the repository).
