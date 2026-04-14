import {
  BanknoteArrowDown,
  CreditCard,
  Landmark,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/dashboard/bank-accounts",
    label: "Bank accounts",
    icon: Landmark,
  },
  {
    href: "/dashboard/credit-cards",
    label: "Credit cards",
    icon: CreditCard,
  },
  {
    href: "/dashboard/income",
    label: "Income",
    icon: BanknoteArrowDown,
  },
  {
    href: "/dashboard/expenses",
    label: "Expenses",
    icon: WalletCards,
  },
];
