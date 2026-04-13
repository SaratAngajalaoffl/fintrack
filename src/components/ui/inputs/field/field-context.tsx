"use client";

import * as React from "react";

export type FieldContextValue = {
  descriptionId?: string;
  errorId?: string;
  hasError: boolean;
  required?: boolean;
};

export const FieldContext = React.createContext<FieldContextValue | null>(null);

export function useFieldContext() {
  return React.useContext(FieldContext);
}

/** Spread onto inputs/textareas inside `Field` for `aria-*` wiring. */
export function useFieldInputAriaProps(): {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
} {
  const field = useFieldContext();
  if (!field) return {};
  const describedBy = field.hasError ? field.errorId : field.descriptionId;
  return {
    "aria-describedby": describedBy,
    "aria-invalid": field.hasError || undefined,
    "aria-required": field.required,
  };
}

export type FieldProps = {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};
