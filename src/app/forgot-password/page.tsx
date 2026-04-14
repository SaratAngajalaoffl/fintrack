import Link from "next/link";

import { AuthPageLayout } from "@/components/ui/layout";
import { ForgotPasswordForm } from "@/components/ui/forms/forgot-password-form";
import { Button } from "@/components/ui";

export const metadata = {
  title: "Forgot password — Fintrack",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageLayout>
      <div className="space-y-6">
        <ForgotPasswordForm />
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Back to log in</Link>
          </Button>
        </div>
      </div>
    </AuthPageLayout>
  );
}
