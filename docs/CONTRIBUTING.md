# Contributing to Fintrack

Thank you for your interest in Fintrack. This project is open source and welcomes contributions from the community.

## Ways to contribute

- **Report bugs** — Open an issue with steps to reproduce, expected behavior, and your environment (OS, Node version, how you run the app).
- **Suggest features** — Open an issue to discuss ideas before large changes; this keeps work aligned and avoids duplicate effort.
- **Submit pull requests** — Fix bugs, improve docs, or add features. For non-trivial changes, an issue first is appreciated.

## Development setup

1. **Requirements:** [Node.js](https://nodejs.org/) (LTS recommended), [npm](https://www.npmjs.com/) (or compatible client), and optionally [Docker](https://www.docker.com/) with Docker Compose for the full stack.
2. **Clone** the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd fintrack
   npm install
   ```
3. **Environment:** Copy `.env.example` to `.env` and adjust values for your machine. See the root [README](../README.md) for how `DATABASE_URL` is used when running locally vs. in Docker.
4. **Run** the app (see README for Docker and local options).

After changes, run formatting and lint locally (the same checks run on commit via git hooks):

```bash
npm run format
npm run lint
```

## Pull request guidelines

- Keep changes **focused** — one logical change per PR when possible.
- **Describe** what changed and why in the PR description.
- Ensure **lint passes** and the app **builds** (`npm run build`) for non-trivial UI or config changes.
- Match existing **style and patterns** in the codebase.

For deeper project conventions (structure, theming, Docker, migrations), see [AGENTS.md](../AGENTS.md) in the repository root.

## Code of conduct

Be respectful and constructive in issues and pull requests. Assume good intent; disagree on technical details without personal attacks.

---

Questions are welcome in issues or discussions (if enabled on the repository).
