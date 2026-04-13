"use client";

import * as React from "react";

import { useFieldInputAriaProps } from "@/components/ui/inputs/field";

import { SelectTrigger } from "./SelectTrigger";

export function SelectTriggerWithField(
  props: React.ComponentPropsWithoutRef<typeof SelectTrigger>,
) {
  const aria = useFieldInputAriaProps();
  return <SelectTrigger {...aria} {...props} />;
}
