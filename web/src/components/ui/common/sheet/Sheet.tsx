"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

function Sheet({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

export { Sheet };
