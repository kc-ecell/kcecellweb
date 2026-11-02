import { cn } from "@/lib/utils";

/** Lowercase mono eyebrow with a small emerald index, e.g. "02 · events". */
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
    <p className={cn("label-mono flex items-center gap-2", className)}>
      {index ? <span className="text-lime">{index}</span> : null}
      <span>{children}</span>
    </p>
  );
}
