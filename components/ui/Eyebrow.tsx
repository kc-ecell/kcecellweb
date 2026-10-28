import { cn } from "@/lib/utils";

/** `[01] // WHAT WE RUN` — mono label with the index in lime. */
export function Eyebrow({
  index,
  children,
  className,
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("label-mono", className)}>
      {index ? <span className="text-lime">[{index}]</span> : null}{" "}
      <span>
        {"// "}
        {children}
      </span>
    </p>
  );
}
