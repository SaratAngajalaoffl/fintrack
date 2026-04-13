"use client";

import * as React from "react";

import { Input, inputClassName } from "@/components/ui/inputs/input";
import { useFieldInputAriaProps } from "@/components/ui/inputs/field";
import { cn } from "@/lib/utils";

export type CurrencyControlProps = Omit<
  React.ComponentProps<typeof Input>,
  "id" | "inputMode" | "type"
> & {
  id: string;
  /** ISO 4217 currency code (e.g. "USD"). */
  currencyCode: string;
};

export function CurrencyControl({
  id,
  currencyCode,
  className,
  ...props
}: CurrencyControlProps) {
  const aria = useFieldInputAriaProps();
  return (
    <Input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      startAdornment={currencyCode}
      data-slot="currency-control"
      className={cn(inputClassName, "tabular-nums", className)}
      {...aria}
      {...props}
    />
  );
}
