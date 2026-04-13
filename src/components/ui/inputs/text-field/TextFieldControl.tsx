"use client";

import * as React from "react";

import { Input, inputClassName } from "@/components/ui/inputs/input";
import { useFieldInputAriaProps } from "@/components/ui/inputs/field";
import { cn } from "@/utils/tailwind-utils";

export type TextFieldControlProps = Omit<
  React.ComponentProps<typeof Input>,
  "id"
> & {
  id: string;
};

export function TextFieldControl({
  id,
  className,
  ...props
}: TextFieldControlProps) {
  const aria = useFieldInputAriaProps();
  return (
    <Input
      id={id}
      data-slot="text-field-control"
      className={cn(inputClassName, className)}
      {...aria}
      {...props}
    />
  );
}
