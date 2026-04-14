"use client";

import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";

import { cn } from "@/lib/utils";

type ToasterProps = ComponentProps<typeof Sonner>;

/**
 * Global toast host — mount once in the root layout. Call `toast` from `sonner`
 * (re-exported from `@/components/ui/common/toast`).
 */
export function Toaster({ className, ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-center"
      closeButton
      className={cn("toaster group z-100", className)}
      toastOptions={{
        classNames: {
          toast: cn(
            "group border border-border bg-surface-0/95 text-foreground shadow-lg backdrop-blur-md",
            "data-[type=success]:border-border data-[type=success]:bg-surface-0/95",
            "data-[type=error]:border-destructive/40 data-[type=error]:bg-destructive/10",
            "data-[type=info]:border-border data-[type=info]:bg-mantle/95",
            "data-[type=warning]:border-amber-500/30 data-[type=warning]:bg-amber-500/10",
          ),
          title: "text-foreground font-medium",
          description: "text-subtext-1 text-sm",
          actionButton:
            "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground",
          cancelButton: "text-subtext-1",
          closeButton: "text-subtext-0",
        },
      }}
      {...props}
    />
  );
}
