"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

export { Tooltip };
