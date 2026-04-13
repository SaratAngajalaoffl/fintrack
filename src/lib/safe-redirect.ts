/** Limits open redirects: same-app path only. */
export function safeRedirectPath(
  path: string | undefined,
  fallback = "/dashboard",
) {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return fallback;
  }
  return path;
}
