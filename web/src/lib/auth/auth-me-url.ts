import { getApiRoute } from "@/configs/api-routes";

/**
 * Absolute URL for `GET /api/auth/me`.
 * When `API_ORIGIN` / `NEXT_PUBLIC_API_ORIGIN` is unset, uses the same origin as `requestUrl`
 * (requires a same-origin API or a rewrite — prefer setting an API origin for split stacks).
 */
export function getAuthMeUrl(requestUrl: string): string {
  const route = getApiRoute("authMe");
  if (route.startsWith("http://") || route.startsWith("https://")) {
    return route;
  }
  return new URL(route, requestUrl).toString();
}
