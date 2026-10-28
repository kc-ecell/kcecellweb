import { cn } from "@/lib/utils";

type Phase = "upcoming" | "live" | "past" | "tba";

const map: Record<Phase, { label: string; dot: string; text: string }> = {
  upcoming: { label: "UPCOMING", dot: "bg-lime", text: "text-lime" },
  live: { label: "LIVE", dot: "bg-err animate-pulse", text: "text-err" },
  past: { label: "PAST", dot: "bg-fg-dim", text: "text-fg-dim" },
  tba: { label: "TBA", dot: "bg-warn", text: "text-warn" },
};

/** LED dot + mono label. See docs/DESIGN_SYSTEM.md §5. */
export function StatusPill({
  phase,
  className,
}: {
  phase: Phase;
  className?: string;
}) {
  const s = map[phase];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs tracking-[0.08em]",
        s.text,
        className,
      )}
    >
      <span className={cn("rounded-pill size-1.5", s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
}
