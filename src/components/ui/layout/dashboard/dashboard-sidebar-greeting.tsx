"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getAppRoute } from "@/configs/app-routes";
import { dicebearThumbsAvatarUrl } from "@/lib/avatars/dicebear-thumbs";
import { cn } from "@/lib/utils";

const AVATAR_SIZE = 48;

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() ?? "";
  if (!local) return "there";
  const first = local.split(/[._-]/)[0] ?? local;
  const cleaned = first.replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned) return "there";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

function timeOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

type DashboardSidebarGreetingProps = {
  email: string;
  className?: string;
  /** Called when the overview link is activated (e.g. to close the mobile sheet). */
  onNavigate?: () => void;
};

export function DashboardSidebarGreeting({
  email,
  className,
  onNavigate,
}: DashboardSidebarGreetingProps) {
  const pathname = usePathname();
  const isOverview = pathname === getAppRoute("dashboard");
  const avatarUrl = dicebearThumbsAvatarUrl(
    email.trim() || "user",
    AVATAR_SIZE,
  );
  const name = displayNameFromEmail(email);

  return (
    <div className={cn("border-b border-border/60 pb-3", className)}>
      <Link
        href={getAppRoute("dashboard")}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-lg px-2 py-1.5 outline-none transition-colors",
          "hover:bg-surface-0/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          isOverview && "bg-surface-1 text-foreground",
        )}
        aria-current={isOverview ? "page" : undefined}
      >
        <Image
          src={avatarUrl}
          alt=""
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          className="size-12 shrink-0 rounded-full bg-muted object-cover"
          unoptimized
        />
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs text-subtext-1">{timeOfDayGreeting()}</p>
          <p className="truncate font-medium text-foreground">{name}</p>
        </div>
      </Link>
    </div>
  );
}
