import * as React from "react";

import { cn } from "@/utils/tailwind-utils";

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5 border-b border-border px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}

export { CardHeader };
