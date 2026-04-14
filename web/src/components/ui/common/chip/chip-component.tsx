import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        outline: "border-border bg-transparent text-foreground shadow-none",
        filled: "border-transparent bg-primary/15 text-primary shadow-sm",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

export type ChipComponentProps = VariantProps<typeof chipVariants> & {
  className?: string;
  children: ReactNode;
  /** When set, renders a trailing control (e.g. clear filter navigation). */
  trailing?: ReactNode;
};

export function ChipComponent({
  className,
  variant,
  children,
  trailing,
}: ChipComponentProps) {
  return (
    <span data-slot="chip" className={cn(chipVariants({ variant }), className)}>
      <span className="min-w-0 truncate">{children}</span>
      {trailing ? (
        <span className="flex shrink-0 items-center">{trailing}</span>
      ) : null}
    </span>
  );
}
