"use client";

import * as React from "react";

import { Input, inputClassName } from "@/components/ui/inputs/input";
import { useFieldInputAriaProps } from "@/components/ui/inputs/field";
import { cn } from "@/utils/tailwind-utils";

export type NumericControlProps = Omit<
  React.ComponentProps<typeof Input>,
  "id" | "inputMode" | "type"
> & {
  id: string;
};

export function NumericControl({
  id,
  className,
  ...props
}: NumericControlProps) {
  const aria = useFieldInputAriaProps();
  return (
    <Input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      data-slot="numeric-control"
      className={cn(inputClassName, "tabular-nums", className)}
      {...aria}
      {...props}
    />
  );
}
