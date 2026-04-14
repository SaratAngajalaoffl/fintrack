import {
  BanknoteArrowDown,
  Building2,
  CreditCard,
  Landmark,
  Repeat2,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { getAppRoute } from "@/configs/app-routes";

export type DashboardNavSubItem = {
  href: string;
  label: string;
};

export type DashboardNavItem = {
  label: string;
  icon: LucideIcon;
  items: DashboardNavSubItem[];
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    label: "Bank Accounts",
    icon: Landmark,
    items: [
      { href: getAppRoute("dashboardBankAccounts"), label: "My Bank Accounts" },
      {
        href: getAppRoute("dashboardBankStatements"),
        label: "Bank Statements",
      },
    ],
  },
  {
    label: "Credit Cards",
    icon: CreditCard,
    items: [
      { href: getAppRoute("dashboardCreditCards"), label: "My Credit Cards" },
      {
        href: getAppRoute("dashboardCreditCardBills"),
        label: "Credit Card Bills",
      },
    ],
  },
  {
    label: "Expenses",
    icon: Wallet,
    items: [
      { href: getAppRoute("dashboardExpenses"), label: "My Expenses" },
      { href: getAppRoute("dashboardExpenseEmis"), label: "EMIs" },
      { href: getAppRoute("dashboardExpenseLoans"), label: "Loans" },
    ],
  },
  {
    label: "Receivables",
    icon: BanknoteArrowDown,
    items: [
      { href: getAppRoute("dashboardIncome"), label: "Income" },
      { href: getAppRoute("dashboardLending"), label: "Lending" },
    ],
  },
  {
    label: "Transactions",
    icon: Repeat2,
    items: [
      {
        href: getAppRoute("dashboardTransactionsInternal"),
        label: "Internal",
      },
      {
        href: getAppRoute("dashboardTransactionsCredits"),
        label: "Credits",
      },
      {
        href: getAppRoute("dashboardTransactionsDebits"),
        label: "Debits",
      },
    ],
  },
  {
    label: "Organisation",
    icon: Building2,
    items: [
      {
        href: getAppRoute("dashboardExpenseCategories"),
        label: "Expense Categories",
      },
      {
        href: getAppRoute("dashboardFundBuckets"),
        label: "Fund Buckets",
      },
      {
        href: getAppRoute("dashboardExpenseGroups"),
        label: "Expense Groups",
      },
    ],
  },
];
