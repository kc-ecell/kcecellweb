import { cn } from "@/lib/utils";

/** Mono key cap for shortcut hints. */
export function Kbd({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <kbd
      className={cn(
        "border-line bg-ink-700 text-fg-muted inline-flex min-w-6 items-center justify-center rounded-sm border px-1.5 py-0.5 font-mono text-xs",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
