"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

function SheetPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

export { SheetPortal };
