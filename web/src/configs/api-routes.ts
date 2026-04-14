const apiRoutes = {
  authSignup: {
    path: "/api/auth/signup",
  },
  authLogin: {
    path: "/api/auth/login",
  },
  authLogout: {
    path: "/api/auth/logout",
  },
  authMe: {
    path: "/api/auth/me",
  },
  authAccountData: {
    path: "/api/auth/account-data",
  },
  authForgotPassword: {
    path: "/api/auth/forgot-password",
  },
  authResetPassword: {
    path: "/api/auth/reset-password",
  },
  authChangePasswordRequestOtp: {
    path: "/api/auth/change-password/request-otp",
  },
  authChangePassword: {
    path: "/api/auth/change-password",
  },
  bankAccounts: {
    path: "/api/bank-accounts",
  },
  bankAccountById: {
    path: "/api/bank-accounts/:accountId",
    create: (params: { accountId: string }) =>
      `/api/bank-accounts/${encodeURIComponent(params.accountId)}`,
  },
  fundBuckets: {
    path: "/api/fund-buckets",
  },
  fundBucketAllocate: {
    path: "/api/fund-buckets/:bucketId/allocate",
    create: (params: { bucketId: string }) =>
      `/api/fund-buckets/${encodeURIComponent(params.bucketId)}/allocate`,
  },
  fundBucketUnlock: {
    path: "/api/fund-buckets/:bucketId/unlock",
    create: (params: { bucketId: string }) =>
      `/api/fund-buckets/${encodeURIComponent(params.bucketId)}/unlock`,
  },
  fundBucketPriority: {
    path: "/api/fund-buckets/:bucketId/priority",
    create: (params: { bucketId: string }) =>
      `/api/fund-buckets/${encodeURIComponent(params.bucketId)}/priority`,
  },
  creditCards: {
    path: "/api/credit-cards",
  },
  creditCardById: {
    path: "/api/credit-cards/:cardId",
    create: (params: { cardId: string }) =>
      `/api/credit-cards/${encodeURIComponent(params.cardId)}`,
  },
  expenseCategories: {
    path: "/api/expense-categories",
  },
  expenseCategoryById: {
    path: "/api/expense-categories/:categoryId",
    create: (params: { categoryId: string }) =>
      `/api/expense-categories/${encodeURIComponent(params.categoryId)}`,
  },
} as const;

type ApiRoutes = typeof apiRoutes;
type ApiRouteKey = keyof ApiRoutes;

type ApiRouteParams<T extends ApiRouteKey> = ApiRoutes[T] extends {
  create: (params: infer P) => string;
}
  ? P
  : never;

type GetApiRouteArgs<T extends ApiRouteKey> =
  ApiRouteParams<T> extends never
    ? []
    : undefined extends ApiRouteParams<T>
      ? [params?: ApiRouteParams<T>]
      : [params: ApiRouteParams<T>];

function resolveApiPath<T extends ApiRouteKey>(
  key: T,
  ...args: GetApiRouteArgs<T>
): string {
  const route = apiRoutes[key] as {
    path: string;
    create?: (params?: unknown) => string;
  };
  if (typeof route.create === "function") {
    return route.create(args[0]);
  }
  return route.path;
}

/**
 * Base URL for the Go HTTP API (no trailing slash).
 *
 * - **Browser:** `NEXT_PUBLIC_API_ORIGIN` only (baked into the client bundle).
 * - **Server:** prefers `API_ORIGIN`, then `NEXT_PUBLIC_API_ORIGIN` (e.g. Docker SSR can call `http://api:8080`).
 *
 * When this returns `""`, `getApiRoute()` produces same-origin paths like `/api/auth/login`. For split
 * stacks (Next + Go on different origins), set **`NEXT_PUBLIC_API_ORIGIN`** (and **`API_ORIGIN`** for
 * server/middleware) so **`middleware.ts`** and **`getSession()`** can reach **`GET /api/auth/me`** on the API.
 *
 * When set to an absolute URL (e.g. `http://127.0.0.1:8080`), rewrites are disabled — enable CORS on the API
 * (`CORS_ALLOWED_ORIGINS`) for credentialed `fetch`.
 */
export function getApiOrigin(): string {
  const isServer = typeof window === "undefined";
  const raw = isServer
    ? (process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_ORIGIN)
    : process.env.NEXT_PUBLIC_API_ORIGIN;
  const u = typeof raw === "string" ? raw.trim().replace(/\/$/, "") : "";
  return u;
}

export const getApiRoute = <T extends ApiRouteKey>(
  key: T,
  ...args: GetApiRouteArgs<T>
): string => {
  const path = resolveApiPath(key, ...args);
  const origin = getApiOrigin();
  return origin ? `${origin}${path}` : path;
};

export type { ApiRouteKey };
export default apiRoutes;
