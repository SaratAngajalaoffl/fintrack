"use client";

import * as React from "react";

import {
  Button,
  type ButtonProps,
} from "@/components/ui/common/buttons/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/common/tooltip";

export type ButtonWithTooltipProps = ButtonProps & {
  /** Shown on hover/focus after a short delay (Radix tooltip). */
  tooltip: React.ReactNode;
  tooltipSide?: "top" | "right" | "bottom" | "left";
};

/**
 * Button with an accessible hover/focus tooltip. Prefer this over the native `title` attribute for consistent styling and timing.
 * Must be rendered under {@link TooltipProvider} (see root layout).
 */
export function ButtonWithTooltip({
  tooltip,
  tooltipSide = "top",
  children,
  ...buttonProps
}: ButtonWithTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...buttonProps}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
