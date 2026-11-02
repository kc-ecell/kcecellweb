import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { StatusPill } from "@/components/ui/StatusPill";
import { Panel } from "@/components/ui/Panel";
import { Card } from "@/components/ui/Card";
import { Kbd } from "@/components/ui/Kbd";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { Magnetic } from "@/components/motion/Magnetic";
import { Tilt } from "@/components/motion/Tilt";

export const metadata = { robots: { index: false, follow: false } };

function Row({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-line border-t py-8">
      <Eyebrow>{title}</Eyebrow>
      <div className="mt-4 flex flex-wrap items-center gap-4">{children}</div>
    </section>
  );
}

export default function DevKit() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl font-bold">/dev/kit</h1>
      <p className="text-fg-muted mt-2 text-sm">
        Build Mode primitives. Dev only. Try{" "}
        <code className="text-fg font-mono">?motion=off</code>.
      </p>

      <Row title="Scramble">
        <ScrambleText
          as="h2"
          text="Decode on mount"
          className="font-display text-3xl font-bold"
        />
      </Row>

      <Row title="Buttons">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost →</Button>
        <ButtonLink href="/dev/kit">As link</ButtonLink>
      </Row>

      <Row title="Tags & status">
        <Tag accent="lime">Leadership</Tag>
        <Tag accent="cyan">Technical</Tag>
        <Tag accent="orange">Events</Tag>
        <Tag accent="pink">Media</Tag>
        <Tag accent="violet">Faculty</Tag>
        <StatusPill phase="upcoming" />
        <StatusPill phase="live" />
        <StatusPill phase="past" />
        <StatusPill phase="tba" />
      </Row>

      <Row title="Panel & card">
        <Panel title="events.tsx" className="w-full max-w-sm">
          <p className="text-fg-muted font-mono text-sm">
            terminal-chrome panel body
          </p>
        </Panel>
        <Card className="w-full max-w-xs">
          <p className="text-sm">Bordered card. Hover me.</p>
        </Card>
      </Row>

      <Row title="Kbd & skeleton">
        <span className="text-fg-muted flex items-center gap-2 text-sm">
          Press <Kbd>⌘</Kbd> <Kbd>K</Kbd>
        </span>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Row>

      <Row title="Empty state">
        <div className="w-full max-w-md">
          <EmptyState
            message="Nothing fits those filters. Clear them or try another year."
            action={<Button variant="secondary">Clear filters</Button>}
          />
        </div>
      </Row>

      <Row title="Motion — reveal & count">
        <Reveal>
          <Card className="w-full max-w-xs">
            <p className="text-sm">I fade + rise when scrolled into view.</p>
          </Card>
        </Reveal>
        <span className="font-display text-lime text-5xl font-extrabold">
          <CountUp value={500} suffix="+" />
        </span>
      </Row>

      <Row title="Motion — magnetic & tilt (full tier)">
        <Magnetic>
          <Button>Pull me</Button>
        </Magnetic>
        <Tilt className="w-40">
          <Card>
            <p className="text-sm">Tilt to pointer</p>
          </Card>
        </Tilt>
      </Row>

      <p className="text-fg-dim mt-10 text-xs">
        Site-wide and not shown here: the custom cursor (full-tier desktop) and
        per-navigation page transitions. The lime-scanline View Transition is a
        Phase 4 upgrade.
      </p>
    </Container>
  );
}
