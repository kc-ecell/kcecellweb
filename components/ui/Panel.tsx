import { cn } from "@/lib/utils";

/** Terminal-chrome panel: top bar with 3 square LED dots + a mono filename. */
export function Panel({
  title,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("corner-ticks bg-ink-800 shadow-card", className)}>
      <div className="border-line flex items-center gap-3 border-b px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="bg-line-hi size-2" />
          <span className="bg-line-hi size-2" />
          <span className="bg-lime size-2" />
        </span>
        {title ? (
          <span className="text-fg-dim font-mono text-xs">{title}</span>
        ) : null}
      </div>
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </div>
  );
}
