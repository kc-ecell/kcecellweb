import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { ScrambleText } from "@/components/motion/ScrambleText";

// Phase 1 skeleton home. Real sections (WebGL hero, stats, rail, deck…) land
// in Phase 3/4 from docs/PAGES.md §1. This is the shell + masthead pattern.
export default function Home() {
  return (
    <Container className="flex flex-1 flex-col justify-center gap-6 py-24">
      <Eyebrow index="00">Entrepreneurship Cell · KCCEMSR, Thane</Eyebrow>
      <ScrambleText
        as="h1"
        text="Ideas in. Startups out."
        className="font-display leading-[0.95] font-extrabold tracking-[-0.02em] text-[var(--text-display)]"
      />
      <p className="text-fg-muted max-w-[48ch] text-[var(--text-lead)]">
        We help students move from intent to execution through ventures,
        hackathons, mentorship, and visible outcomes.
      </p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/events">See upcoming events</ButtonLink>
        <ButtonLink href="/team" variant="secondary">
          Meet the team
        </ButtonLink>
      </div>
      <p className="label-mono flex items-center gap-2">
        EST. 2016 · 500+ MEMBERS · SIH 2025 WINNERS · press <Kbd>⌘K</Kbd>
      </p>
    </Container>
  );
}
