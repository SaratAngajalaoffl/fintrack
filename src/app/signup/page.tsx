import Link from "next/link";

import { Button } from "@/components/ui";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-[var(--page-padding-x)] py-16">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Sign up
        </h1>
        <p className="text-subtext-1">
          Account creation is not wired up yet. This route is a placeholder for
          the landing page CTA.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
