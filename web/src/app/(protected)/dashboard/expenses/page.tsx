import { redirect } from "next/navigation";

import { getAppRoute } from "@/configs/app-routes";

export const metadata = {
  title: "My Expenses Redirect — Fintrack",
};

export default function ExpensesPage() {
  redirect(getAppRoute("dashboardExpenses"));
}
