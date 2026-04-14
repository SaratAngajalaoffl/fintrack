import Image from "next/image";
import Link from "next/link";

import { Github } from "@/components/icons";
import { UserProfileMenu } from "@/components/ui/common/user-profile-menu";
import { Button } from "@/components/ui";
import { getAppRoute } from "@/configs/app-routes";
import { getSession } from "@/lib/auth/session";
import { GITHUB_REPO_URL } from "@/lib/site";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/30 bg-transparent backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between gap-4 p-(--page-padding-x)">
        <Link
          href={getAppRoute("home")}
          className="flex min-w-0 shrink-0 items-center rounded-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Image
            src="/brand/long_logo.png"
            alt="Fintrack"
            width={376}
            height={124}
            className="h-9 w-auto max-w-[min(100%,240px)] object-contain object-left"
            priority
          />
        </Link>
        <nav
          className="flex shrink-0 items-center gap-1 sm:gap-2"
          aria-label="Site and account"
        >
          <Button variant="ghost" size="icon" asChild>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Fintrack on GitHub"
            >
              <Github />
            </a>
          </Button>
          {session ? (
            <UserProfileMenu email={session.email} />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={getAppRoute("login")}>Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={getAppRoute("signup")}>Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
