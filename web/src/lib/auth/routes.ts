/**
 * Central place for auth-related path rules. Keep in sync with `src/middleware.ts` matcher.
 */

/** URL prefixes that require a valid session cookie (middleware + layouts). */
export const PROTECTED_PREFIXES = ["/dashboard"] as const;

/** Auth UI routes; logged-in users are redirected to the app shell. */
export const AUTH_PAGE_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isAuthPagePath(pathname: string): boolean {
  return (AUTH_PAGE_PATHS as readonly string[]).includes(pathname);
}
