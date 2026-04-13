"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { Button } from "@/components/ui/buttons/button";
import {
  useFieldInputAriaProps,
  type FieldProps,
} from "@/components/ui/inputs/field";
import { Check } from "@/components/icons";
import { cn } from "@/utils/tailwind-utils";

import type { MultiSelectFieldProps } from "./types";

export function MultiSelectControl({
  id,
  options,
  value,
  onValueChange,
  placeholder = "Choose…",
  disabled,
}: Omit<MultiSelectFieldProps, keyof FieldProps | "id"> & { id: string }) {
  const aria = useFieldInputAriaProps();
  const [open, setOpen] = React.useState(false);

  const toggle = (v: string) => {
    if (value.includes(v)) {
      onValueChange(value.filter((x) => x !== v));
    } else {
      onValueChange([...value, v]);
    }
  };

  const summary =
    value.length === 0
      ? placeholder
      : value
          .map((v) => options.find((o) => o.value === v)?.label ?? v)
          .join(", ");

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="h-10 w-full justify-between font-normal"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="dialog"
          {...aria}
        >
          <span className="truncate text-left">{summary}</span>
          <span className="text-subtext-1">▾</span>
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="multi-select-content"
          align="start"
          sideOffset={6}
          className="z-50 w-[var(--radix-popover-trigger-width)] max-w-[min(100vw-2rem,24rem)] rounded-lg border border-border bg-mantle p-2 shadow-md"
        >
          <ul
            className="max-h-60 space-y-0.5 overflow-y-auto py-1"
            role="listbox"
          >
            {options.map((opt) => {
              const checked = value.includes(opt.value);
              return (
                <li key={opt.value} role="option" aria-selected={checked}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-surface-0",
                      opt.disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    <CheckboxPrimitive.Root
                      className="flex size-4 shrink-0 items-center justify-center rounded border border-border bg-background data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                      checked={checked}
                      disabled={opt.disabled}
                      onCheckedChange={() => toggle(opt.value)}
                    >
                      <CheckboxPrimitive.Indicator>
                        <Check className="size-3 text-primary-foreground" />
                      </CheckboxPrimitive.Indicator>
                    </CheckboxPrimitive.Root>
                    <span>{opt.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
