import type * as React from "react";

import type { FieldProps } from "@/components/ui/inputs/field";

export type SelectFieldProps = Omit<FieldProps, "children"> & {
  id?: string;
  placeholder?: string;
  options: { value: string; label: React.ReactNode; disabled?: boolean }[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  children?: React.ReactNode;
};
