## React Server Components (default)

The App Router treats modules as **Server Components** unless the file starts with **`"use client"`**.

1. **Prefer server for app code:** `page.tsx`, `layout.tsx`, and feature UI should be Server Components when possible. They can `import` client components as children; the server file itself stays a server module.
2. **Add `"use client"` only when needed:** `useState`, `useEffect`, other hooks, browser APIs (`window`, `document`, `matchMedia`, …), or event handlers that must attach in that module, or libraries that only run on the client (e.g. many Radix primitives).
3. **Shrink the client boundary:** If only part of a screen is interactive, move that part into a small client file (e.g. `feature-interactive.tsx`) and keep the route or parent as a server component that composes it.
4. **UI kit:** Files under `web/src/components/ui/` often use `"use client"` because of Radix/hooks — that is expected. Do not add `"use client"` to a file **only** because it imports `@/components/ui`; the importer can remain a server component.
5. **Data:** Prefer fetching and secrets on the server (Server Components, Route Handlers, server actions) unless the data must live in the browser. For client-side API calls, keep fetch/request functions in `web/src/services/` and consume them via React Query hooks under `web/src/components/hooks/queries/`.

### shadcn/ui and Radix

The project follows **[shadcn/ui](https://ui.shadcn.com)** conventions: **`web/components.json`** (run shadcn CLI from **`web/`**), **`cn()` in `web/src/lib/utils.ts`** (`clsx` + `tailwind-merge`, matches the CLI alias), plus composable components under `web/src/components/ui/`.

**Important:** Official shadcn registry components are **implemented with [Radix UI](https://www.radix-ui.com) primitives** (e.g. `@radix-ui/react-dialog`, `@radix-ui/react-select`) plus Tailwind. Those **`@radix-ui/react-*` packages are required dependencies** — they are not optional add-ons. You **cannot** remove Radix from **`web/package.json`** and keep stock shadcn components; there is no supported "Radix-free" shadcn build.

- **Prefer** adding or updating UI via the CLI from **`web/`**: `npx shadcn@latest add <component>` (or `add --all` after backing up), rather than hand-rolling new Radix wrappers.
- Import **`cn`** from **`@/lib/utils`** (same path the shadcn CLI uses via `components.json` aliases).
- If you **must** avoid Radix entirely, you would need a **different** stack (e.g. [React Aria](https://react-spectrum.adobe.com/react-aria/), native `<dialog>`, custom controls) — **not** the default shadcn registry — and expect a full rewrite of interactive primitives.

## UI component structure

Everything under `web/src/components/` is organized as **`hooks/`**, **`icons/`**, and **`ui/`**. Do **not** add a top-level `web/src/components/auth/` (or similar domain folders): authentication **routes** live under `web/src/app/`, **app HTTP** for migrated domains is in **`api/`**; **`web/src/app/api/`** may still hold other Route Handlers, and **shared auth-related UI** belongs under the `ui/` subtrees below.

### UI kit (primitives)

Shared primitives live under `web/src/components/ui/`. **One main component per file** (plus small colocated helpers). Group related pieces in a **kebab-case folder** named after the feature.

| Area               | Path pattern                                                                                    | Notes                                                                                                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form controls      | `common/inputs/<name>/`                                                                         | e.g. `common/inputs/field/`, `common/inputs/input/`, `common/inputs/label/`, `common/inputs/text-field/`, `common/inputs/select/`. Split `FooField` and `FooControl` into separate files when both exist. |
| Buttons & overlays | `common/buttons/`, `common/card/`, `common/dialog/`, `common/dropdown-menu/`, `common/tooltip/` | shadcn-style primitives: `Button`, `Card`, `Dialog`, menus, tooltips. One file per exported part (`DialogContent.tsx`, `CardHeader.tsx`, …).                                                              |
| Shared types       | Next to the feature                                                                             | e.g. `common/inputs/multi-select/types.ts` to avoid circular imports between sibling modules.                                                                                                             |

**Barrel:** `web/src/components/ui/index.ts` re-exports **primitives** from `common/` (`inputs/`, `buttons/`, `card/`, `dialog/`, …). **Import from `@/components/ui`** for `Button`, `Card`, `TextField`, etc.

### Composed app UI (also under `ui/`)

Screens and chrome built **from** the kit (and each other) live in sibling folders under `web/src/components/ui/`. **One kebab-case folder per component**; add an `index.ts` that re-exports the public symbol so consumers can import `@/components/ui/forms/login-form` (folder path) without repeating the file name.

| Area        | Path pattern     | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Forms**   | `forms/<name>/`  | Multi-field route forms: login, signup, forgot/reset/change password, etc. Colocate small helpers (e.g. OTP field) under `forms/` as their own folder when shared across forms.                                                                                                                                                                                                                                                                                   |
| **Common**  | `common/<name>/` | **Primitives** (see table above): `common/inputs/`, `common/buttons/`, `common/card/`, … **App chrome** in the same tree: `common/background/` (`InteractiveBackground`, site-wide in root `layout.tsx`), `common/toast/` (`Toaster` + re-exported `toast` from **Sonner** — mount `Toaster` once in root `layout.tsx`; call `toast.success` / `toast.error` / `toast.info` from client code), `common/header/` (`SiteHeader`), `common/user-profile-menu/`, etc. |
| **Landing** | `landing/`       | Marketing landing sections (e.g. hero).                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Layout**  | `layout/`        | Route-level layout wrappers (e.g. `AuthPageLayout` for auth pages).                                                                                                                                                                                                                                                                                                                                                                                               |

**Barrel:** `web/src/components/ui/common/index.ts` re-exports frequently used **app chrome** (interactive background, `toast` / `Toaster`, header, profile menu). **`forms/index.ts`** re-exports form entry points for convenience; prefer specific paths when only one form is needed. Prefer **`@/components/ui`** for primitives (`Button`, `Dialog`, …) rather than deep paths into `common/buttons/`, unless you are editing those modules.

Inline SVG **icon components** live in **`web/src/components/icons/`** (not under `ui/`); see [Icons](#icons).

**Conventions:** Use `cn()` from **`@/lib/utils`**. Match naming and imports in sibling files; add `"use client"` only where the UI primitive requires it. After adding or changing a primitive, **extend the showcase** (below).

### Hooks

**Location:** `web/src/components/hooks/`.

- Add **shared** custom hooks here (used in more than one place or clearly library-level). Name files **`use-kebab-case.ts`** (e.g. `use-mouse-reactive-gradient.ts`) and export the hook as a named function **`useThing`**.
- **Barrel:** `web/src/components/hooks/index.ts` re-exports hooks so consumers can import from **`@/components/hooks`** or **`@/components/hooks/use-something`**.
- **Query hooks:** Put React Query hooks in `web/src/components/hooks/queries/` (e.g. `use-mutate-login.ts`, future `use-get-bank-accounts.ts`). Keep each hook focused on one endpoint or resource behavior.
- **Service split:** Keep raw request/fetch logic in `web/src/services/` and call those service functions from query hooks, not directly from UI components.
- Hooks that are **only** used by a single feature may stay next to that feature until reuse is needed; prefer moving them into `components/hooks/` when they stabilize or are shared.
- Hooks that use browser-only APIs (`window`, `document`, `matchMedia`, etc.) are only safe from **client** components; do not call them from Server Components.

### Icons

All icon assets follow one of two locations; do not leave ad hoc icon files under unrelated `public/` paths.

| Kind                                          | Location                        | Use when                                                                                                                                                                                                                      |
| --------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Static files** (`.svg`, `.png`, `.webp`, …) | **`web/public/icons/`**         | You reference a file by URL: `next/image`, `<img src="/icons/name.svg">`, CSS `url()`, or metadata. Subfolders are allowed (e.g. `public/icons/categories/groceries.png`).                                                    |
| **React components** (inline SVG)             | **`web/src/components/icons/`** | Shared across the app (e.g. selects, multi-select). One component per file (`PascalCase.tsx`), export from `index.ts`, import via **`@/components/icons`**. Prefer `currentColor` for stroke/fill so icons follow text color. |

**Brand logos** stay in **`web/public/brand/`** only — not under `web/public/icons/`.

### Showcase page

The route **`/showcase`** uses a **server** `page.tsx` that renders the client module **`showcase-content.tsx`** (metadata stays in `layout.tsx`). When you **add a new component**, **new variants**, or **meaningful behavior** to `web/src/components/ui/`:

1. Add or update a **section** in **`web/src/app/showcase/showcase-content.tsx`** that demonstrates the component (and variants, if any).
2. Keep demos **interactive** where state matters (dialogs, selects, menus); that file remains a client component.
3. Prefer **realistic copy** (labels, placeholders) so spacing and typography stay honest.

Do not leave the showcase stale after user-visible kit changes.
