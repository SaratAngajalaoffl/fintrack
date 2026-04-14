"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { getAppRoute } from "@/configs/app-routes";

export function DashboardSidebarLogout() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push(getAppRoute("home"));
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full border-border/80 text-destructive hover:bg-destructive/15 hover:text-destructive"
      onClick={() => void logout()}
    >
      <LogOut aria-hidden />
      Log out
    </Button>
  );
}
