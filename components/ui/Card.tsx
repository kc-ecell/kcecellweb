import { cn } from "@/lib/utils";

/** Raised card. Depth comes from a soft shadow, not an outline. */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-ink-800 hover:shadow-card-hover shadow-card p-5 transition-shadow duration-[var(--dur-fast)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
