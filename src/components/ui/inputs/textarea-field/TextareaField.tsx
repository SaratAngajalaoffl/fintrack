"use client";

import * as React from "react";

import { Field, type FieldProps } from "@/components/ui/inputs/field";
import { TextareaControl } from "./TextareaControl";

export type TextareaFieldProps = Omit<FieldProps, "children"> &
  Omit<React.ComponentProps<"textarea">, "id" | "className"> & {
    id?: string;
    /** Applied to the inner `<textarea>`. */
    inputClassName?: string;
  };

export function TextareaField({
  label,
  description,
  error,
  required,
  className,
  id: idProp,
  inputClassName,
  ...textareaProps
}: TextareaFieldProps) {
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
      <TextareaControl
        id={id}
        inputClassName={inputClassName}
        {...textareaProps}
      />
    </Field>
  );
}
