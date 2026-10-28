import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { NAV_LINKS } from "@/components/site/nav-links";

// Footer. Row 2's giant wordmark reacts to the cursor in Phase 4; static here.
// The blinking cursor on the copyright line becomes a terminal trigger later.
export function Footer() {
  return (
    <footer className="border-line bg-ink-900 mt-auto border-t">
      <Container className="py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <nav aria-label="Explore" className="flex flex-col gap-2">
            <p className="label-mono mb-1">Explore</p>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-fg-muted hover:text-fg text-sm"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2">
            <p className="label-mono mb-1">Reach us</p>
            <p className="text-fg-muted text-sm">KCCEMSR, Kopri, Thane (E)</p>
            <p className="text-fg-muted text-sm">Reply in ≤ 2 working days</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="label-mono mb-1">Follow</p>
            <p className="text-fg-dim text-sm">Instagram · LinkedIn</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="label-mono mb-1">Status</p>
            <p className="text-fg-dim text-sm">v26.10 · build mode</p>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="font-display text-ink-700 mt-16 leading-none font-extrabold tracking-[-0.03em] text-[var(--text-mega)] select-none"
        >
          E-CELL
        </p>

        <div className="text-fg-dim mt-6 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <span>© 2026 E-Cell KCCEMSR_</span>
          <span>Built by the E-Cell Web Dev team</span>
        </div>
      </Container>
    </footer>
  );
}
