const appRoutes = {
  home: {
    path: "/",
  },
  login: {
    path: "/login",
    create: (params?: { redirect?: string }) => {
      if (!params?.redirect) return "/login";
      const query = new URLSearchParams({
        redirect: params.redirect,
      });
      return `/login?${query.toString()}`;
    },
  },
  signup: {
    path: "/signup",
  },
  forgotPassword: {
    path: "/forgot-password",
  },
  resetPassword: {
    path: "/reset-password",
  },
  showcase: {
    path: "/showcase",
  },
  dashboard: {
    path: "/dashboard",
  },
  dashboardIncome: {
    path: "/dashboard/income",
  },
  dashboardExpenses: {
    path: "/dashboard/expenses",
  },
  dashboardCreditCards: {
    path: "/dashboard/credit-cards",
  },
  dashboardChangePassword: {
    path: "/dashboard/change-password",
  },
  dashboardBankAccounts: {
    path: "/dashboard/bank-accounts",
  },
  dashboardBankAccountsNew: {
    path: "/dashboard/bank-accounts/new",
  },
} as const;

type AppRoutes = typeof appRoutes;
type AppRouteKey = keyof AppRoutes;

type AppRouteParams<T extends AppRouteKey> = AppRoutes[T] extends {
  create: (params: infer P) => string;
}
  ? P
  : never;

type GetAppRouteArgs<T extends AppRouteKey> =
  AppRouteParams<T> extends never
    ? []
    : undefined extends AppRouteParams<T>
      ? [params?: AppRouteParams<T>]
      : [params: AppRouteParams<T>];

export const getAppRoute = <T extends AppRouteKey>(
  key: T,
  ...args: GetAppRouteArgs<T>
): string => {
  const route = appRoutes[key];
  if ("create" in route) {
    return route.create(args[0] as AppRouteParams<T>);
  }
  return route.path;
};

export type { AppRouteKey };
export default appRoutes;
