"use client";

import * as React from "react";

import { Field } from "@/components/ui/common/inputs/field";
import { NumericControl } from "./NumericControl";

export type NumericFieldProps = Omit<
  React.ComponentProps<typeof Field>,
  "children"
> &
  Omit<React.ComponentProps<typeof NumericControl>, "id"> & {
    id?: string;
  };

export function NumericField({
  label,
  description,
  error,
  required,
  className,
  id: idProp,
  ...controlProps
}: NumericFieldProps) {
  const uid = React.useId();
  const id = idProp ?? uid;

  return (
    <Field
      label={label}
      description={description}
      error={error}
      htmlFor={id}
      required={required}
      className={className}
    >
      <NumericControl id={id} {...controlProps} />
    </Field>
  );
}
