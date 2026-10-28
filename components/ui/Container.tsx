import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] px-4 sm:px-[clamp(1rem,3vw,2rem)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
