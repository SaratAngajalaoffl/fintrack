"use client";

import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";

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

type ForgotValues = {
  email: string;
};

export function ForgotPasswordForm() {
  const [info, setInfo] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<ForgotValues>({
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotValues) {
    clearErrors("root");
    setInfo(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      otpToken?: string;
      expiresAt?: string;
    };
    if (!res.ok) {
      setError("root", {
        message: body.error ?? "Something went wrong",
      });
      return;
    }
    if (body.otpToken && body.expiresAt) {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            otpToken: body.otpToken,
            expiresAt: body.expiresAt,
            email: data.email,
          }),
        );
      } catch {
        /* ignore */
      }
    }
    setInfo(
      body.message ??
        "If an account exists, check server logs for the OTP and continue on the reset page.",
    );
  }

  return (
    <Card className="border-border/60 bg-muted/80 shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Forgot password
        </CardTitle>
        <CardDescription>
          Enter your email. In development, the OTP is printed in the server
          console; your browser stores the reset token for the next step.
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
          {errors.root?.message ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.root.message}
            </p>
          ) : null}
          {info ? (
            <p className="text-sm text-subtext-1" role="status">
              {info}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending…" : "Continue"}
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto" asChild>
            <Link href="/reset-password">Enter reset code</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
