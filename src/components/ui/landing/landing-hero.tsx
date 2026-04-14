import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui";

export type LandingHeroProps = {
  /** When true, primary CTA goes to the protected dashboard instead of sign up. */
  isAuthenticated?: boolean;
};

export function LandingHero({ isAuthenticated = false }: LandingHeroProps) {
  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col overflow-hidden">
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-(--page-padding-x) py-14 sm:py-20">
        <div className="flex max-w-2xl flex-col items-center text-center">
          <Image
            src="/brand/round_logo.png"
            alt="Fintrack"
            width={112}
            height={112}
            priority
            className="mb-8 h-24 w-24 object-contain drop-shadow-lg sm:h-28 sm:w-28"
          />
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Your money, one clear view
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-subtext-1 sm:text-xl">
            Fintrack brings balances, categories, and spending into a single
            calm workspace — so you always know where you stand.
          </p>
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            {isAuthenticated ? (
              <Button className="min-w-[160px]" size="lg" asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button className="min-w-[160px]" size="lg" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
                <Button
                  className="min-w-[160px]"
                  size="lg"
                  variant="outline"
                  asChild
                >
                  <Link href="/login">Log in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
