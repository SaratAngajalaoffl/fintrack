import { redirect } from "next/navigation";

import { getAppRoute } from "@/configs/app-routes";

export const metadata = {
  title: "Bank Accounts Redirect — Fintrack",
};

export default function BankAccountsPage() {
  redirect(getAppRoute("dashboardBankAccounts"));
}
