import { cn } from "@/lib/utils";

type Accent = "lime" | "cyan" | "orange" | "pink" | "violet" | "line";

const accents: Record<Accent, string> = {
  lime: "border-lime text-lime",
  cyan: "border-cyan text-cyan",
  orange: "border-orange text-orange",
  pink: "border-pink text-pink",
  violet: "border-violet text-violet",
  line: "border-line text-fg-muted",
};

/** Mono pill with a 1px accent border. Department / format / stack labels. */
export function Tag({
  accent = "line",
  className,
  children,
}: {
  accent?: Accent;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded-pill inline-flex items-center border px-3 py-1 font-mono text-xs tracking-[0.06em] uppercase",
        accents[accent],
        className,
      )}
    >
      {children}
    </span>
  );
}
