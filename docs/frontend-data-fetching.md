# Frontend data fetching

Fintrack is server-first with App Router. Use browser-side fetching only for interactive client behavior.

## React Query boilerplate

- Provider: `src/services/react-query/react-query-provider.tsx`
- Mounted in root layout: `src/app/layout.tsx`
- Library: `@tanstack/react-query`

## Usage conventions

- Keep `page.tsx` and non-interactive sections as Server Components.
- Keep request functions in `src/services/` (e.g. `src/services/auth/auth-api.ts`).
- In client components, use query hooks from `src/components/hooks/queries/` rather than calling `fetch` directly.
- Build endpoints with `getApiRoute(...)` from `src/configs/api-routes.ts`.
- Build UI/app paths with `getAppRoute(...)` from `src/configs/app-routes.ts`.

## Current adoption

Auth-related client actions (login, signup, forgot/reset/change password, logout) use React Query mutations.
