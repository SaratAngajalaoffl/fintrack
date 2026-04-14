import Link from "next/link";

import { AuthPageLayout } from "@/components/ui/layout";
import { ResetPasswordForm } from "@/components/ui/forms/reset-password-form";
import { Button } from "@/components/ui";
import { getAppRoute } from "@/configs/app-routes";

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
            <Link href={getAppRoute("home")}>Back to home</Link>
          </Button>
        </div>
      </div>
    </AuthPageLayout>
  );
}
