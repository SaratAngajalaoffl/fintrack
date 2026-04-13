import * as React from "react";

import { cn } from "@/utils/tailwind-utils";

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center border-t border-border px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}

export { CardFooter };
