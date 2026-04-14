import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui — merge Tailwind classes (`clsx` + `tailwind-merge`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
