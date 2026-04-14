"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

function SheetClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

export { SheetClose };
