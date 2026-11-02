import { Masthead } from "@/components/site/Masthead";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";

// Phase 1 scaffold for routes whose real, data-driven content arrives in
// Phase 3. Keeps the shell + masthead + an honest empty state so nav never
// 404s and there is no lorem.
export function PlaceholderPage({
  index,
  eyebrow,
  title,
  readout,
  line,
  message,
}: {
  index: string;
  eyebrow: string;
  title: string;
  readout?: string;
  line: string;
  message: string;
}) {
  return (
    <>
      <Masthead
        index={index}
        eyebrow={eyebrow}
        title={title}
        readout={readout}
      />
      <Container className="pb-24">
        <div className="max-w-xl">
          <EmptyState
            line={line}
            message={message}
            action={
              <ButtonLink href="/" variant="secondary">
                Back to home
              </ButtonLink>
            }
          />
        </div>
      </Container>
    </>
  );
}
