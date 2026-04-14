# Contributing to Fintrack

Thank you for your interest in Fintrack. This project is open source and welcomes contributions from the community.

## Ways to contribute

- **Report bugs** — Open an issue with steps to reproduce, expected behavior, and your environment (OS, Node version, how you run the app).
- **Suggest features** — Open an issue to discuss ideas before large changes; this keeps work aligned and avoids duplicate effort.
- **Submit pull requests** — Fix bugs, improve docs, or add features. For non-trivial changes, an issue first is appreciated.

## Development setup

1. **Requirements:** [Node.js](https://nodejs.org/) (LTS recommended), [npm](https://www.npmjs.com/) (or compatible client), [Go](https://go.dev/) 1.22+ if you work on `api/`, and optionally [Docker](https://www.docker.com/) with Docker Compose for the full stack.
2. **Clone** the repository and install **frontend** dependencies from **`web/`** (this repo does not use npm workspaces):

   ```bash
   git clone <repository-url>
   cd fintrack
   cd web
   npm install
   ```

   Optional — enable **pre-commit** (Prettier + ESLint via **`lint-staged`**): **`git config core.hooksPath .githooks`** once per clone. Hooks are checked in under **`.githooks/`** (no Husky).

3. **Environment:** Copy **`api/.env.example`** → **`api/.env`** and **`web/.env.example`** → **`web/.env.local`** (or **`web/.env`**). For Docker Compose, optionally add a **root** `.env` with **`POSTGRES_*`** and ports (see the [README](../README.md)).
4. **Run** the app from **`web/`** (`npm run dev`); see the README for Docker and the optional Go API in **`api/`**.

After changes, run formatting and lint locally (the same checks run on commit via git hooks):

```bash
cd web
npm run format
npm run lint
```

## Pull request guidelines

- Keep changes **focused** — one logical change per PR when possible.
- **Describe** what changed and why in the PR description.
- Ensure **lint passes** and the app **builds** (`cd web && npm run build`) for non-trivial UI or config changes.
- Match existing **style and patterns** in the codebase.

For deeper project conventions (structure, theming, Docker, migrations), see [AGENTS.md](../AGENTS.md) in the repository root.

## Code of conduct

Be respectful and constructive in issues and pull requests. Assume good intent; disagree on technical details without personal attacks.

---

Questions are welcome in issues or discussions (if enabled on the repository).
