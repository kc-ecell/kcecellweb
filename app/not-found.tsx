import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[70vh] flex-col justify-center py-20">
      <p className="eyebrow mb-2">404 · route not found</p>
      <h1 className="display">
        page pivoted out of existence<span className="dot-accent">.</span>
      </h1>
      <p className="text-muted mt-6 max-w-lg text-lg">
        the link you followed doesn&apos;t exist or hasn&apos;t shipped yet.
        here is how to get back to what&apos;s live.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <ButtonLink href="/" variant="primary" size="lg">
          <span>back to home</span>
          <span className="arrow" aria-hidden="true">
            <span>→</span>
          </span>
        </ButtonLink>
        <ButtonLink href="/events" variant="light" size="lg">
          <span>view events</span>
          <span className="arrow" aria-hidden="true">
            <span>→</span>
          </span>
        </ButtonLink>
      </div>
    </div>
  );
}
