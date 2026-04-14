"use client";

import * as React from "react";

import { Field } from "@/components/ui/common/inputs/field";
import { CurrencyControl } from "./CurrencyControl";

export type CurrencyFieldProps = Omit<
  React.ComponentProps<typeof Field>,
  "children"
> &
  Omit<React.ComponentProps<typeof CurrencyControl>, "id"> & {
    id?: string;
  };

export function CurrencyField({
  label,
  description,
  error,
  required,
  className,
  id: idProp,
  ...controlProps
}: CurrencyFieldProps) {
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
      <CurrencyControl id={id} {...controlProps} />
    </Field>
  );
}
