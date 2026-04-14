import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
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
    <div className="flex flex-1 flex-col px-(--page-padding-x) py-12">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-subtext-1">
            Signed-in workspace — add accounts, transactions, and reports here
            as you build Fintrack.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-border/80 bg-surface-0/85 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                This area is only available when you are signed in.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-subtext-1">
              Use the cards on this page as panels over the live background.
              Replace or extend them with real widgets as features land.
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-surface-0/85 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Your account</CardTitle>
              <CardDescription>Session and access status</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-subtext-1">
              <p>
                <span className="font-medium text-foreground">
                  Signed in as{" "}
                </span>
                {user?.email ?? session.email}
              </p>
              {user && !user.is_approved ? (
                <p className="mt-3 text-amber-200/90">
                  Your account is not approved yet; some actions may be limited
                  until an administrator approves it.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div>
          <Button variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
