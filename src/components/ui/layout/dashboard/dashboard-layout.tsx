import type { ReactNode } from "react";

import { getSession } from "@/lib/auth/session";

import { DashboardMobileNav } from "./dashboard-mobile-nav";
import { DashboardSidebar } from "./dashboard-sidebar";

export async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const email = session?.email ?? "";

  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col">
      <DashboardSidebar email={email} />
      <DashboardMobileNav email={email} />
      <main className="flex flex-1 flex-col py-8 pl-(--page-padding-x) pr-14 md:py-12 md:pr-(--page-padding-x) md:pl-[calc(1rem+16rem+var(--page-padding-x))]">
        <div className="w-full flex-1">{children}</div>
      </main>
    </div>
  );
}
