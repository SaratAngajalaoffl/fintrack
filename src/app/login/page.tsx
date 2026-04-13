import Link from "next/link";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata = {
  title: "Log in — Fintrack",
};

type PageProps = {
  searchParams: Promise<{ redirect?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params.redirect;
  const redirectParam = Array.isArray(raw) ? raw[0] : raw;
  const redirectTo = safeRedirectPath(redirectParam);

  return (
    <AuthPageLayout>
      <div className="space-y-6">
        <LoginForm redirectTo={redirectTo} />
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-subtext-1">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </AuthPageLayout>
  );
}
