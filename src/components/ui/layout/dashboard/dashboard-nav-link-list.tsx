"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

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
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      DASHBOARD_NAV_ITEMS.map((section) => [
        section.label,
        section.items.some(
          (item) =>
            pathname === item.href || pathname.startsWith(`${item.href}/`),
        ),
      ]),
    ),
  );

  React.useEffect(() => {
    setExpandedSections((current) => {
      const next = { ...current };
      for (const section of DASHBOARD_NAV_ITEMS) {
        const hasActiveItem = section.items.some(
          (item) =>
            pathname === item.href || pathname.startsWith(`${item.href}/`),
        );
        if (hasActiveItem) {
          next[section.label] = true;
        }
      }
      return next;
    });
  }, [pathname]);

  const toggleSection = (sectionLabel: string) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionLabel]: !current[sectionLabel],
    }));
  };

  return (
    <nav
      aria-label="Dashboard sections"
      className={cn("flex flex-1 flex-col", className)}
    >
      <ul className="flex flex-col gap-0.5">
        {DASHBOARD_NAV_ITEMS.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections[section.label] ?? false;

          return (
            <li key={section.label} className="rounded-lg px-1 py-1">
              <button
                type="button"
                onClick={() => toggleSection(section.label)}
                className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs font-semibold tracking-wide text-subtext-0 uppercase transition-colors hover:bg-surface-0/70 hover:text-foreground"
                aria-expanded={isExpanded}
              >
                <SectionIcon className="size-3.5 shrink-0" aria-hidden />
                <span className="flex-1">{section.label}</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 transition-transform",
                    isExpanded ? "rotate-180" : "",
                  )}
                  aria-hidden
                />
              </button>
              <ul
                className={cn("space-y-0.5", isExpanded ? "block" : "hidden")}
              >
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "ml-2 flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
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
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
