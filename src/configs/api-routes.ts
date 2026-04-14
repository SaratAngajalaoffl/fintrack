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

export const getApiRoute = <T extends ApiRouteKey>(
  key: T,
  ...args: GetApiRouteArgs<T>
): string => {
  const route = apiRoutes[key];
  if ("create" in route) {
    return route.create(args[0] as ApiRouteParams<T>);
  }
  return route.path;
};

export type { ApiRouteKey };
export default apiRoutes;
