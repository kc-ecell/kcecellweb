import { cn } from "@/lib/utils";

export function Section({
  alt = false,
  className,
  children,
  ...rest
}: React.ComponentProps<"section"> & { alt?: boolean }) {
  return (
    <section
      className={cn(
        "py-[clamp(4rem,10vw,9rem)]",
        alt ? "bg-ink-900" : "bg-void",
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}
