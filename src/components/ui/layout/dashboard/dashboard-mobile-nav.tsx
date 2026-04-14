"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui";

import { DashboardAccountSettingsLink } from "./dashboard-account-settings-link";
import { DashboardSidebarGreeting } from "./dashboard-sidebar-greeting";
import { DashboardSidebarLogout } from "./dashboard-sidebar-logout";
import { DashboardNavLinkList } from "./dashboard-nav-link-list";

type DashboardMobileNavProps = {
  email: string;
};

export function DashboardMobileNav({ email }: DashboardMobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="fixed top-18 right-4 z-30 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="border-border/80 bg-surface-0/90 shadow-lg backdrop-blur-md"
            aria-label="Open dashboard menu"
          >
            <Menu className="size-5" aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent showCloseButton className="gap-6">
          <SheetHeader>
            <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Jump to a section of your Fintrack dashboard.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 pr-2">
            <DashboardSidebarGreeting
              email={email}
              onNavigate={() => setOpen(false)}
            />
            <DashboardNavLinkList onNavigate={() => setOpen(false)} />
            <div className="space-y-2">
              <DashboardAccountSettingsLink onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-border/60 pt-3">
              <DashboardSidebarLogout />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
