"use client";

import * as React from "react";

import { Label } from "@/components/ui/inputs/label";
import { cn } from "@/lib/utils";

import { RadioGroup } from "./RadioGroup";
import { RadioGroupItem } from "./RadioGroupItem";

export type RadioFieldProps = {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  name?: string;
  options: { value: string; label: React.ReactNode; disabled?: boolean }[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  orientation?: "vertical" | "horizontal";
  className?: string;
};

/**
 * Radio group with group label, description, error, and per-option labels.
 */
export function RadioField({
  label,
  description,
  error,
  name = "radio",
  options,
  value,
  defaultValue,
  onValueChange,
  disabled,
  required,
  orientation = "vertical",
  className,
}: RadioFieldProps) {
  const uid = React.useId();
  const labelId = `${uid}-label`;
  const descriptionId = `${uid}-description`;
  const errorId = `${uid}-error`;
  const describedBy = error ? errorId : description ? descriptionId : undefined;

  return (
    <div
      data-slot="radio-field"
      className={cn("flex w-full flex-col gap-1.5", className)}
    >
      {label ? (
        <Label id={labelId} className="flex items-center gap-1">
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden>
              *
            </span>
          ) : null}
        </Label>
      ) : null}
      <RadioGroup
        name={name}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(
          orientation === "horizontal"
            ? "flex flex-wrap gap-4"
            : "flex flex-col gap-2",
        )}
      >
        {options.map((opt) => {
          const itemId = `${uid}-${opt.value}`;
          return (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem
                value={opt.value}
                id={itemId}
                disabled={opt.disabled}
              />
              <Label
                htmlFor={itemId}
                className="cursor-pointer font-normal text-foreground"
              >
                {opt.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
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
  );
}
