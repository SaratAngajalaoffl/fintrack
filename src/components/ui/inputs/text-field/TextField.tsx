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

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      description,
      error,
      required,
      className,
      id: idProp,
      ...controlProps
    },
    ref,
  ) {
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
        <TextFieldControl id={id} ref={ref} {...controlProps} />
      </Field>
    );
  },
);
TextField.displayName = "TextField";
