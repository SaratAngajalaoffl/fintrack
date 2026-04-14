"use client";

import * as React from "react";

import { Field } from "@/components/ui/common/inputs/field";
import { MultiSelectControl } from "./MultiSelectControl";
import type { MultiSelectFieldProps } from "./types";

export type { MultiSelectFieldProps };

/**
 * Multi-value selection in a popover with checkboxes. Controlled `value` / `onValueChange`.
 */
export function MultiSelectField({
  label,
  description,
  error,
  required,
  className,
  id: idProp,
  options,
  value,
  onValueChange,
  placeholder,
  disabled,
}: MultiSelectFieldProps) {
  const genId = React.useId();
  const id = idProp ?? genId;

  return (
    <Field
      label={label}
      description={description}
      error={error}
      htmlFor={id}
      required={required}
      className={className}
    >
      <MultiSelectControl
        id={id}
        options={options}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </Field>
  );
}
