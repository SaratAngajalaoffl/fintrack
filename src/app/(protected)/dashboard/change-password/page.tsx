import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/components/ui/forms/change-password-form";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "Change password — Fintrack",
};

export default async function ChangePasswordPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/dashboard/change-password");
  }

  return (
    <div className="flex flex-1 flex-col bg-background px-(--page-padding-x) py-12">
      <div className="mx-auto w-full max-w-md">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
