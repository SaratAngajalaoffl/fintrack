"use client";

import * as React from "react";

import { Field } from "@/components/ui/inputs/field";

import { Select, SelectValue } from "./select-roots";
import { SelectContent } from "./SelectContent";
import { SelectItem } from "./SelectItem";
import { SelectTriggerWithField } from "./SelectTriggerWithField";
import type { SelectFieldProps } from "./select-field-types";

export type { SelectFieldProps };

/**
 * Radix Select with label, description, and error wired through `Field`.
 */
export function SelectField({
  label,
  description,
  error,
  required,
  className,
  id: idProp,
  placeholder = "Select…",
  options,
  value,
  defaultValue,
  onValueChange,
  disabled,
  name,
  children,
}: SelectFieldProps) {
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
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
        required={required}
      >
        <SelectTriggerWithField id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTriggerWithField>
        <SelectContent>
          {children ??
            options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
