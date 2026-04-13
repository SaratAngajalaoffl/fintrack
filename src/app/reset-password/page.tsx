import Link from "next/link";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui";

export const metadata = {
  title: "Reset password — Fintrack",
};

export default function ResetPasswordPage() {
  return (
    <AuthPageLayout>
      <div className="space-y-6">
        <ResetPasswordForm />
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </AuthPageLayout>
  );
}
