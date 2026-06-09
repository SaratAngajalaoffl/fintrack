# Fintrack — agent guide

<!-- BEGIN:nextjs-agent-rules -->

This project uses a current Next.js release; APIs and conventions may differ from older training data. Prefer `node_modules/next` types and docs for the installed version.

<!-- END:nextjs-agent-rules -->

This document orients coding agents and contributors to how Fintrack is organized, built, and styled. Read it before adding features or restructuring the repo.

## What not to do

- Do not commit secrets or real `.env` files.
- Do not **`git commit`** on the user's behalf unless they explicitly ask you to; see agent-workflow.
- Do not introduce large refactors unrelated to the task; match existing patterns and file layout.
- Do not add `web/src/components/auth/` (or other top-level domain folders next to `hooks/` / `icons/` / `ui/`); place auth-related UI under `web/src/components/ui/forms/`, `common/`, or `layout/`.
- Do not edit `.pen` design files with plain text tools; use the Pencil MCP tooling if those assets exist.

## When in doubt

Prefer small, reviewable changes; one feature per branch; semantic theme tokens; typed server boundaries where data crosses the DB or API.

---

Detailed guidance is split into focused modules under `docs/agents/`. Read the relevant file(s) for your task:

| Topic | File |
| ----- | ---- |
| Agent workflow & commit rules | @docs/agents/agent-workflow.md |
| Product overview & domain map | @docs/agents/product-domains.md |
| Go API + Next.js integration & auth | @docs/agents/api-architecture.md |
| Go API testing & coverage | @docs/agents/testing.md |
| Tech stack & Next.js version note | @docs/agents/tech-stack.md |
| React Server Components, shadcn/Radix, UI structure, hooks, icons, showcase | @docs/agents/react-components.md |
| Repository layout & submodule conventions | @docs/agents/repo-layout.md |
| Dev / test / build commands | @docs/agents/commands.md |
| UI theming rules & Catppuccin palette | @docs/agents/ui-theming.md |
| Database migrations | @docs/agents/database.md |
| Docker & Compose notes | @docs/agents/docker.md |
