"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export { SheetTrigger };
