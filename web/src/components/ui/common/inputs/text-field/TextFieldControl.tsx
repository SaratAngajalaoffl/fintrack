"use client";

import * as React from "react";

import { Input, inputClassName } from "@/components/ui/common/inputs/input";
import { useFieldInputAriaProps } from "@/components/ui/common/inputs/field";
import { cn } from "@/lib/utils";

export type TextFieldControlProps = Omit<
  React.ComponentProps<typeof Input>,
  "id"
> & {
  id: string;
};

export const TextFieldControl = React.forwardRef<
  HTMLInputElement,
  TextFieldControlProps
>(function TextFieldControl({ id, className, ...props }, ref) {
  const aria = useFieldInputAriaProps();
  return (
    <Input
      ref={ref}
      id={id}
      data-slot="text-field-control"
      className={cn(inputClassName, className)}
      {...aria}
      {...props}
    />
  );
});
TextFieldControl.displayName = "TextFieldControl";
