# Route configuration

Fintrack keeps route constants in `src/configs/` to avoid scattering literal path strings across UI and API callers.

## Files

- `src/configs/app-routes.ts`
  - Defines app/page routes.
  - Exports `getAppRoute()` for typed route access.
- `src/configs/api-routes.ts`
  - Defines API endpoint routes.
  - Exports `getApiRoute()` for typed endpoint access.

## Usage

- Prefer `getAppRoute("...")` and `getApiRoute("...")` over hardcoded paths.
- When adding a new page route or API endpoint, update the corresponding config in the same PR.
- If a route needs params or query strings, add a `create()` function on that route entry to generate the full URL in one place.
