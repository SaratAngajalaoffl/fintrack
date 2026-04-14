export type DashboardNavItem = {
  href: string;
  label: string;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/bank-accounts", label: "Bank accounts" },
  { href: "/dashboard/credit-cards", label: "Credit cards" },
  { href: "/dashboard/income", label: "Income" },
  { href: "/dashboard/expenses", label: "Expenses" },
];
