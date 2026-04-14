import { redirect } from "next/navigation";

import { getAppRoute } from "@/configs/app-routes";

export const metadata = {
  title: "Credit Cards Redirect — Fintrack",
};

export default function CreditCardsPage() {
  redirect(getAppRoute("dashboardCreditCards"));
}
