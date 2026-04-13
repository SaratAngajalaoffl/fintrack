import type * as React from "react";

import type { FieldProps } from "@/components/ui/inputs/field";

export type MultiSelectFieldProps = Omit<FieldProps, "children"> & {
  id?: string;
  options: { value: string; label: React.ReactNode; disabled?: boolean }[];
  value: string[];
  onValueChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};
