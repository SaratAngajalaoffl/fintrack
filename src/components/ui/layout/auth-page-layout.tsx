import type { ReactNode } from "react";

import { LandingHeroBackground } from "@/components/ui/landing";

/**
 * Server layout: the animated gradient is a client child (`LandingHeroBackground`);
 * this wrapper stays a Server Component so static structure and links can stay on the server.
 */
export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col overflow-hidden">
      <LandingHeroBackground />
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-[var(--page-padding-x)] py-14 sm:py-20">
        <div className="auth-panel-in w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
