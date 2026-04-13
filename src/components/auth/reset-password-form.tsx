"use client";

import Link from "next/link";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

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

const STORAGE_KEY = "fintrack_password_reset";

type ResetValues = {
  email: string;
  otp: string;
  otpToken: string;
  newPassword: string;
};

export function ResetPasswordForm() {
  const router = useRouter();
  const [success, setSuccess] = React.useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<ResetValues>({
    defaultValues: {
      email: "",
      otp: "",
      otpToken: "",
      newPassword: "",
    },
  });

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        otpToken?: string;
        email?: string;
      };
      reset({
        email: parsed.email ?? "",
        otp: "",
        otpToken: parsed.otpToken ?? "",
        newPassword: "",
      });
    } catch {
      /* ignore */
    }
  }, [reset]);

  async function onSubmit(data: ResetValues) {
    clearErrors("root");
    setSuccess(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    if (!res.ok) {
      setError("root", {
        message: body.error ?? "Could not reset password",
      });
      return;
    }
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSuccess(body.message ?? "Password updated. You can sign in.");
    const current = getValues();
    reset({ ...current, otp: "", newPassword: "" });
    router.refresh();
  }

  return (
    <Card className="border-border/60 bg-muted/80 shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Reset password
        </CardTitle>
        <CardDescription>
          Use the 6-digit code from the server log and the token from the
          forgot-password step (pre-filled when possible).
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
          <Controller
            name="otp"
            control={control}
            rules={{
              required: "OTP is required",
              validate: (v) => /^\d{6}$/.test(v) || "OTP must be 6 digits",
            }}
            render={({ field }) => (
              <TextField
                label="OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                error={errors.otp?.message}
                name={field.name}
                onBlur={field.onBlur}
                ref={field.ref}
                value={field.value}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  field.onChange(v);
                }}
              />
            )}
          />
          <TextField
            label="Reset token (otpToken)"
            error={errors.otpToken?.message}
            description="JWT from the forgot-password response, or paste manually."
            {...register("otpToken", { required: "Reset token is required" })}
          />
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          {errors.root?.message ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.root.message}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm text-subtext-1" role="status">
              {success}{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Go to log in
              </Link>
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating…" : "Update password"}
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto" asChild>
            <Link href="/login">Back to log in</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
