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
    path: "/dashboard/receivables/income",
  },
  dashboardExpenses: {
    path: "/dashboard/expenses/my-expenses",
  },
  dashboardExpenseEmis: {
    path: "/dashboard/expenses/emis",
  },
  dashboardExpenseLoans: {
    path: "/dashboard/expenses/loans",
  },
  dashboardCreditCards: {
    path: "/dashboard/credit-cards/my-credit-cards",
  },
  dashboardCreditCardBills: {
    path: "/dashboard/credit-cards/bills",
  },
  dashboardChangePassword: {
    path: "/dashboard/change-password",
  },
  dashboardAccountSettings: {
    path: "/dashboard/account-settings",
  },
  dashboardBankAccounts: {
    path: "/dashboard/bank-accounts/my-bank-accounts",
  },
  dashboardBankStatements: {
    path: "/dashboard/bank-accounts/statements",
  },
  dashboardLending: {
    path: "/dashboard/receivables/lending",
  },
  dashboardTransactionsInternal: {
    path: "/dashboard/transactions/internal",
  },
  dashboardTransactionsCredits: {
    path: "/dashboard/transactions/credits",
  },
  dashboardTransactionsDebits: {
    path: "/dashboard/transactions/debits",
  },
  dashboardExpenseCategories: {
    path: "/dashboard/organisation/expense-categories",
  },
  dashboardFundBuckets: {
    path: "/dashboard/organisation/fund-buckets",
  },
  dashboardExpenseGroups: {
    path: "/dashboard/organisation/expense-groups",
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
  const route = appRoutes[key] as {
    path: string;
    create?: (params?: unknown) => string;
  };
  if (typeof route.create === "function") {
    return route.create(args[0]);
  }
  return route.path;
};

export type { AppRouteKey };
export default appRoutes;
