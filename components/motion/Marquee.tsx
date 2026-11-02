import { cn } from "@/lib/utils";

// Stock-ticker band. Pure CSS (server component): two copies, the second
// aria-hidden, pauses on hover, static on the off tier. See docs/ANIMATIONS.md §13.
function MarqueeCopy({ items, hidden }: { items: string[]; hidden: boolean }) {
  return (
    <ul
      className="label-mono text-fg-muted flex items-center gap-8 pr-8"
      aria-hidden={hidden}
    >
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-8">
          <span>{item}</span>
          <span className="text-lime" aria-hidden="true">
            ▲
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Marquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div
      className={cn("marquee border-line bg-ink-900 border-y py-3", className)}
    >
      <div className="marquee-track">
        <MarqueeCopy items={items} hidden={false} />
        <MarqueeCopy items={items} hidden={true} />
      </div>
    </div>
  );
}
