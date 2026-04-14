"use client";

import * as React from "react";

import { useFieldInputAriaProps } from "@/components/ui/common/inputs/field";
import { cn } from "@/lib/utils";

export const textareaClassName =
  "flex min-h-[80px] w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-subtext-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export type TextareaControlProps = React.ComponentProps<"textarea"> & {
  id: string;
  /** Applied to the inner `<textarea>`. */
  inputClassName?: string;
};

export function TextareaControl({
  id,
  inputClassName,
  ...props
}: TextareaControlProps) {
  const aria = useFieldInputAriaProps();
  return (
    <textarea
      id={id}
      data-slot="textarea"
      className={cn(textareaClassName, inputClassName)}
      {...aria}
      {...props}
    />
  );
}
