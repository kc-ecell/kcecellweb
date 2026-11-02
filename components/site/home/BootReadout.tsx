import { Panel } from "@/components/ui/Panel";

// Static boot log — the hero's focal object until the WebGL particle hero lands
// in Phase 4 (docs/ANIMATIONS.md §1/§2). Numbers are hard-coded for the Phase 1
// skeleton; they come from the `stats` table in Phase 3.
const LINES = [
  { label: "booting ecell.os v26.10", value: "" },
  { label: "mounting /founders", value: "500+ found" },
  { label: "loading /events", value: "100+ ok" },
  { label: "linking /partners", value: "20+ ok" },
  { label: "compiling /wins", value: "SIH 2025 ok" },
];

export function BootReadout() {
  return (
    <Panel title="guest@ecell:~$" className="w-full font-mono text-sm">
      <div className="flex flex-col gap-1.5">
        {LINES.map((line) => (
          <div key={line.label} className="flex items-baseline gap-3">
            <span className="text-fg-dim">&gt;</span>
            <span className="text-fg-muted">{line.label}</span>
            <span
              className="border-line min-w-6 flex-1 self-center border-b border-dotted"
              aria-hidden="true"
            />
            <span className="text-fg">{line.value}</span>
          </div>
        ))}
        <p className="caret text-lime mt-2">status: ready to build</p>
      </div>
    </Panel>
  );
}
