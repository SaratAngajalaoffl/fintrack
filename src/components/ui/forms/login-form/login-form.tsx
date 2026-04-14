"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { useMutateLogin } from "@/components/hooks";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  TextField,
} from "@/components/ui";
import { toast } from "@/components/ui/common/toast";
import { getAppRoute } from "@/configs/app-routes";

type LoginValues = {
  email: string;
  password: string;
};

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const loginMutation = useMutateLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<LoginValues>({
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginValues) {
    clearErrors("root");
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not sign in";
      toast.error(message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Card className="border-border/60 bg-muted/80 shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Log in
        </CardTitle>
        <CardDescription>
          Welcome back — use the email and password for your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting || loginMutation.isPending}
          >
            {isSubmitting || loginMutation.isPending
              ? "Signing in…"
              : "Sign in"}
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto" asChild>
            <Link href={getAppRoute("forgotPassword")}>Forgot password?</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
