import Link from "next/link";

import { AuthPageLayout } from "@/components/ui/layout";
import { SignupForm } from "@/components/ui/forms/signup-form";
import { Button } from "@/components/ui";

export const metadata = {
  title: "Sign up — Fintrack",
};

export default function SignupPage() {
  return (
    <AuthPageLayout>
      <div className="space-y-6">
        <SignupForm />
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </AuthPageLayout>
  );
}
