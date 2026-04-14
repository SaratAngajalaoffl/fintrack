import { cn } from "@/lib/utils";

export type ShimmerComponentProps = {
  className?: string;
};

/**
 * Reusable loading placeholder with a horizontal shimmer sweep.
 */
export function ShimmerComponent({ className }: ShimmerComponentProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-md bg-surface-1/70",
        className,
      )}
    >
      <div className="animate-shimmer absolute inset-y-0 -left-full w-full bg-linear-to-r from-transparent via-surface-2/60 to-transparent" />
    </div>
  );
}
