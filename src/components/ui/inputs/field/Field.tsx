"use client";

import * as React from "react";

import { Label } from "@/components/ui/inputs/label";
import { cn } from "@/lib/utils";

import {
  FieldContext,
  type FieldContextValue,
  type FieldProps,
} from "./field-context";

export type { FieldProps };

/**
 * Label + control + description/error. Use `useFieldContext()` inside custom controls to wire `aria-describedby` / `aria-invalid`.
 */
export function Field({
  label,
  description,
  error,
  htmlFor,
  required,
  children,
  className,
}: FieldProps) {
  const uid = React.useId();
  const descriptionId = `${uid}-description`;
  const errorId = `${uid}-error`;

  const ctx: FieldContextValue = {
    descriptionId: description ? descriptionId : undefined,
    errorId: error ? errorId : undefined,
    hasError: Boolean(error),
    required,
  };

  return (
    <FieldContext.Provider value={ctx}>
      <div
        data-slot="field"
        className={cn("flex w-full flex-col gap-1.5", className)}
      >
        {label ? (
          <Label htmlFor={htmlFor} className="flex items-center gap-1">
            {label}
            {required ? (
              <span className="text-destructive" aria-hidden>
                *
              </span>
            ) : null}
          </Label>
        ) : null}
        {children}
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {error}
          </p>
        ) : description ? (
          <p id={descriptionId} className="text-xs text-subtext-0">
            {description}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}
