"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { getAppRoute } from "@/configs/app-routes";
import { cn } from "@/lib/utils";

type DashboardAccountSettingsLinkProps = {
  onNavigate?: () => void;
};

export function DashboardAccountSettingsLink({
  onNavigate,
}: DashboardAccountSettingsLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === getAppRoute("dashboardAccountSettings") ||
    pathname.startsWith(`${getAppRoute("dashboardAccountSettings")}/`);

  return (
    <Link
      href={getAppRoute("dashboardAccountSettings")}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-surface-1 text-foreground"
          : "text-subtext-1 hover:bg-surface-0/80 hover:text-foreground",
      )}
    >
      <Settings2 className="size-4 shrink-0" aria-hidden />
      Account settings
    </Link>
  );
}
