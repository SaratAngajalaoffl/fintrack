import type { ReactNode } from "react";

/**
 * Auth pages: interactive site background comes from the root layout; this shell
 * only positions the panel and vertical rhythm.
 */
export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col overflow-hidden">
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-(--page-padding-x) py-14 sm:py-20">
        <div className="auth-panel-in w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
