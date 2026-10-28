"use client";

// Sticky top nav. No login / admin / account link anywhere (AGENTS.md rule 1).
// Scroll hide/show is a Phase 4 enhancement. Mobile uses a full-screen sheet.

import { useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/components/site/nav-links";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-line bg-ink-900/95 sticky top-0 z-[var(--z-nav)] border-b backdrop-blur-none">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.1em]"
        >
          <span className="rounded-pill bg-lime size-2" aria-hidden="true" />
          E-CELL
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-fg-muted hover:text-fg font-mono text-sm transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <ButtonLink href="/contact" variant="secondary" className="h-9">
            Contact
          </ButtonLink>
        </nav>

        <button
          type="button"
          className="font-mono text-sm md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "close" : "menu"}
        </button>
      </Container>

      <div
        id="mobile-menu"
        hidden={!open}
        className={cn(
          "bg-void fixed inset-0 top-16 z-[var(--z-nav)] flex-col gap-6 px-6 py-10 md:hidden",
          open ? "flex" : "hidden",
        )}
      >
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="font-display text-3xl font-bold"
          >
            {l.label}
          </Link>
        ))}
        <ButtonLink
          href="/contact"
          variant="primary"
          className="mt-4 w-full"
          onClick={() => setOpen(false)}
        >
          Contact
        </ButtonLink>
        <p className="label-mono mt-auto">
          long-press the logo for the terminal
        </p>
      </div>
    </header>
  );
}
