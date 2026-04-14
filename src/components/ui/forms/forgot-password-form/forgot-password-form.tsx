"use client";

import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useMutateForgotPassword } from "@/components/hooks";
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
import { PASSWORD_RESET_SESSION_KEY } from "@/lib/auth/password-reset-session";

type ForgotValues = {
  email: string;
};

export function ForgotPasswordForm() {
  const router = useRouter();
  const forgotPasswordMutation = useMutateForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<ForgotValues>({
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotValues) {
    clearErrors("root");
    let body:
      | {
          message?: string;
          otpToken?: string;
          expiresAt?: string;
        }
      | undefined;
    try {
      body = await forgotPasswordMutation.mutateAsync(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
      return;
    }
    if (body.otpToken && body.expiresAt) {
      try {
        sessionStorage.setItem(
          PASSWORD_RESET_SESSION_KEY,
          JSON.stringify({
            otpToken: body.otpToken,
            expiresAt: body.expiresAt,
            email: data.email,
          }),
        );
      } catch {
        /* ignore */
      }
      router.push(getAppRoute("resetPassword"));
      return;
    }
    toast.info(
      body.message ??
        "If an account exists for this email, you will receive further instructions.",
    );
  }

  return (
    <Card className="border-border/60 bg-muted/80 shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Forgot password
        </CardTitle>
        <CardDescription>
          Enter the email for your account. If it exists, you can set a new
          password on the next step.
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
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting || forgotPasswordMutation.isPending}
          >
            {isSubmitting || forgotPasswordMutation.isPending
              ? "Sending…"
              : "Continue"}
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto" asChild>
            <Link href={getAppRoute("login")}>Back to log in</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
