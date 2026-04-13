"use client";

import * as React from "react";

import { Field } from "@/components/ui/inputs/field";
import { TextFieldControl } from "./TextFieldControl";

export type TextFieldProps = Omit<
  React.ComponentProps<typeof Field>,
  "children"
> &
  Omit<React.ComponentProps<typeof TextFieldControl>, "id"> & {
    id?: string;
  };

export function TextField({
  label,
  description,
  error,
  required,
  className,
  id: idProp,
  ...controlProps
}: TextFieldProps) {
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
      <TextFieldControl id={id} {...controlProps} />
    </Field>
  );
}
