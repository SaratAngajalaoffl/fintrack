"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/buttons/button";
import { cn } from "@/lib/utils";

import { DialogOverlay } from "./DialogOverlay";
import { DialogPortal } from "./DialogPortal";

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border border-border bg-base p-6 shadow-lg duration-200 sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close-button"
            className="absolute top-4 right-4 rounded-md opacity-70 ring-offset-base transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:pointer-events-none"
            asChild
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              type="button"
            >
              <span aria-hidden className="text-base leading-none">
                ×
              </span>
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export { DialogContent };
