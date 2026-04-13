"use client";

import * as React from "react";

import { cn } from "@/utils/tailwind-utils";

const inputClassName =
  "flex h-10 w-full min-w-0 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-subtext-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export type InputProps = React.ComponentProps<"input"> & {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, startAdornment, endAdornment, disabled, ...props },
    ref,
  ) => {
    if (!startAdornment && !endAdornment) {
      return (
        <input
          ref={ref}
          type={type}
          data-slot="input"
          disabled={disabled}
          className={cn(inputClassName, className)}
          {...props}
        />
      );
    }

    return (
      <div
        data-slot="input-group"
        className={cn(
          "flex h-10 w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-border bg-muted shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {startAdornment ? (
          <span
            className="flex shrink-0 items-center border-r border-border bg-surface-0 px-3 text-sm text-subtext-1"
            aria-hidden
          >
            {startAdornment}
          </span>
        ) : null}
        <input
          ref={ref}
          type={type}
          data-slot="input"
          disabled={disabled}
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-subtext-0 focus-visible:outline-none disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        />
        {endAdornment ? (
          <span
            className="flex shrink-0 items-center border-l border-border bg-surface-0 px-3 text-sm text-subtext-1"
            aria-hidden
          >
            {endAdornment}
          </span>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input, inputClassName };
