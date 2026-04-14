"use client";

import * as React from "react";

import {
  Field,
  useFieldInputAriaProps,
} from "@/components/ui/common/inputs/field";
import { Input, inputClassName } from "@/components/ui/common/inputs/input";
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
        placeholder="6-digit code"
        value={value}
        onBlur={onBlur}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "").slice(0, 6);
          onChange(v);
        }}
        className={cn(inputClassName, "font-mono tabular-nums")}
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

/** Single-line verification code (6 digits), same `Field` + `Input` layout as `TextField`. */
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
    <Field label={label} error={error} htmlFor={id} required>
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
