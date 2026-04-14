"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type CreditCardsActionMenuProps = {
  triggerLabel: string;
  triggerIcon: ReactNode;
  panelClassName?: string;
  children: ReactNode;
};

const TRIGGER_CLASS =
  "h-8 w-8 rounded-lg border border-border bg-surface-0/90 p-0 text-foreground shadow-sm hover:bg-surface-1";

export function CreditCardsActionMenu({
  triggerLabel,
  triggerIcon,
  panelClassName,
  children,
}: CreditCardsActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || !rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className={TRIGGER_CLASS}
        aria-label={triggerLabel}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {triggerIcon}
      </Button>
      {open ? (
        <div
          className={cn(
            "absolute right-0 z-30 mt-1 rounded-xl border border-border/80 bg-surface-0 py-1 shadow-lg",
            panelClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
