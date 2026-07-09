import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names with conflict resolution.
 * Used by shadcn/ui components (Card, Badge, Button, …) on the /apply pages.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
