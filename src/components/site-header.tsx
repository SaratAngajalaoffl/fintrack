import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/30 bg-transparent backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-(--page-padding-x)">
        <Link
          href="/"
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
          aria-label="Account"
        >
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
