"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { DASHBOARD_NAV_ITEMS } from "./dashboard-nav-config";

type DashboardNavLinkListProps = {
  className?: string;
  /** Called after a link is activated (e.g. to close a mobile sheet). */
  onNavigate?: () => void;
};

export function DashboardNavLinkList({
  className,
  onNavigate,
}: DashboardNavLinkListProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard sections"
      className={cn("flex flex-col", className)}
    >
      <ul className="flex flex-col gap-0.5">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-surface-1 text-foreground"
                    : "text-subtext-1 hover:bg-surface-0/80 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
