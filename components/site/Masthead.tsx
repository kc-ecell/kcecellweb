import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

// Inner-page masthead: a small lowercase eyebrow, a serif title, and a
// right-aligned mono "readout" aside, over a hairline. Editorial, no hero image.
export function Masthead({
  index,
  eyebrow,
  title,
  readout,
}: {
  index: string;
  eyebrow: string;
  title: string;
  readout?: string;
}) {
  return (
    <Container className="pt-20 pb-10">
      <Eyebrow index={index}>{eyebrow}</Eyebrow>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-ink leading-[0.98] font-normal tracking-[-0.015em] lowercase">
          {title}
        </h1>
        {readout ? (
          <p className="label-mono shrink-0 pb-2 text-right">{readout}</p>
        ) : null}
      </div>
      <hr className="border-line mt-8" />
    </Container>
  );
}
