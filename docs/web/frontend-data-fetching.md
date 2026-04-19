# Frontend data fetching

Fintrack is server-first with App Router. Use browser-side fetching only for interactive client behavior.

## React Query boilerplate

- Provider: `web/src/services/react-query/react-query-provider.tsx`
- Mounted in root layout: `web/src/app/layout.tsx`
- Library: `@tanstack/react-query`

## Usage conventions

- Keep `page.tsx` and non-interactive sections as Server Components.
- Keep request functions in `web/src/services/` (e.g. `web/src/services/auth/auth-api.ts`).
- In client components, use query hooks from `web/src/components/hooks/queries/` rather than calling `fetch` directly.
- Build API URLs with `getApiRoute(...)` from `web/src/configs/api-routes.ts` (same-origin **`/api/...`** in the browser; server uses **`getApiOrigin()`** — see that file).
- Build UI/app paths with `getAppRoute(...)` from `web/src/configs/app-routes.ts`.

## Current adoption

Auth-related client actions (login, signup, forgot/reset/change password, logout) use React Query mutations.
