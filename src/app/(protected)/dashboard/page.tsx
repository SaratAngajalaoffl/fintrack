import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/user";

export const metadata = {
  title: "Dashboard — Fintrack",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  const user = await findUserById(session.sub);

  return (
    <div className="flex flex-1 flex-col bg-background px-(--page-padding-x) py-12">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-subtext-1">
            Protected route — this area is only available when you are signed
            in. Expand this page with accounts, transactions, and reports as you
            build Fintrack.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/50 p-6 text-sm text-subtext-1">
          <p>
            <span className="font-medium text-foreground">Signed in as </span>
            {user?.email ?? session.email}
            {user && !user.is_approved ? (
              <span className="block pt-2 text-amber-200/90">
                Note: your account is not approved yet; some actions may be
                limited until an administrator approves it.
              </span>
            ) : null}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
