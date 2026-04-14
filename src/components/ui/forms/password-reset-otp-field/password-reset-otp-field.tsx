"use client";

import * as React from "react";

import { Field, useFieldInputAriaProps } from "@/components/ui/inputs/field";
import { Input, inputClassName } from "@/components/ui/inputs/input";
import { cn } from "@/lib/utils";

type InnerProps = {
  id: string;
  name: string;
  value: string;
  onBlur: () => void;
  onChange: (value: string) => void;
};

const PasswordResetOtpControl = React.forwardRef<HTMLInputElement, InnerProps>(
  function PasswordResetOtpControl({ id, name, value, onBlur, onChange }, ref) {
    const aria = useFieldInputAriaProps();

    return (
      <Input
        ref={ref}
        id={id}
        name={name}
        data-slot="password-reset-otp"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        value={value}
        onBlur={onBlur}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "").slice(0, 6);
          onChange(v);
        }}
        className={cn(
          inputClassName,
          "text-center font-mono text-xl tracking-[0.4em] placeholder:text-subtext-0/40",
        )}
        {...aria}
      />
    );
  },
);
PasswordResetOtpControl.displayName = "PasswordResetOtpControl";

type PasswordResetOtpFieldProps = {
  id?: string;
  label?: string;
  error?: string;
  name: string;
  value: string;
  onBlur: () => void;
  onChange: (value: string) => void;
};

/**
 * Single verification code field (6 digits), visually distinct from plain text fields.
 */
export const PasswordResetOtpField = React.forwardRef<
  HTMLInputElement,
  PasswordResetOtpFieldProps
>(function PasswordResetOtpField(
  {
    id: idProp,
    label = "Verification code",
    error,
    name,
    value,
    onBlur,
    onChange,
  },
  ref,
) {
  const uid = React.useId();
  const id = idProp ?? uid;

  return (
    <Field
      label={label}
      error={error}
      htmlFor={id}
      required
      className="rounded-lg border border-border/80 bg-surface-0/40 p-4"
    >
      <PasswordResetOtpControl
        ref={ref}
        id={id}
        name={name}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
      />
    </Field>
  );
});
PasswordResetOtpField.displayName = "PasswordResetOtpField";
