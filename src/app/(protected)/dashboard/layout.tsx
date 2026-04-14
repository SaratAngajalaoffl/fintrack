import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/ui/layout/dashboard";

export default async function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
