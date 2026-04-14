import * as React from "react";

import { cn } from "@/lib/utils";

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-subtext-1", className)}
      {...props}
    />
  );
}

export { CardDescription };
