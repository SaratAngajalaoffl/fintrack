"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

export function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={onLogout}>
      Log out
    </Button>
  );
}
