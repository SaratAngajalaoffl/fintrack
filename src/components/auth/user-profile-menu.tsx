"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { dicebearThumbsAvatarUrl } from "@/lib/avatars/dicebear-thumbs";
import { cn } from "@/lib/utils";

const AVATAR_SIZE = 36;

type UserProfileMenuProps = {
  email: string;
};

export function UserProfileMenu({ email }: UserProfileMenuProps) {
  const router = useRouter();
  const avatarUrl = dicebearThumbsAvatarUrl(email, AVATAR_SIZE);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "rounded-full ring-offset-background transition-[box-shadow,transform] hover:opacity-95",
            "focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-background",
          )}
          aria-label="Account menu"
        >
          <Image
            src={avatarUrl}
            alt=""
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            className="h-9 w-9 rounded-full bg-muted object-cover"
            unoptimized
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link href="/dashboard/change-password">Change password</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/15 focus:text-destructive"
          onSelect={() => {
            void logout();
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
