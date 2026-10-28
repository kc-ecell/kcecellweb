import { cn } from "@/lib/utils";

/** Bordered card. Borders do the work of shadows. */
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
        "border-line bg-ink-800 hover:border-line-hi border p-5 transition-colors duration-[var(--dur-fast)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
