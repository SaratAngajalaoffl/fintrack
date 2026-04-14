import { redirect } from "next/navigation";

import { getAppRoute } from "@/configs/app-routes";

export const metadata = {
  title: "Income Redirect — Fintrack",
};

export default function IncomePage() {
  redirect(getAppRoute("dashboardIncome"));
}
