import { ChangePasswordForm } from "@/components/ui/forms/change-password-form";

export const metadata = {
  title: "Change password — Fintrack",
};

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <ChangePasswordForm />
    </div>
  );
}
