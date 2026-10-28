import { cn } from "@/lib/utils";

/** Loading placeholder. Pulses on its own; reduced-motion disables the pulse. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("bg-ink-700 animate-pulse rounded-sm", className)}
      aria-hidden="true"
    />
  );
}
