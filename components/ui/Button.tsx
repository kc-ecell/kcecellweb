import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex h-12 items-center justify-center gap-2 rounded-sm px-5 font-mono text-sm uppercase tracking-[0.06em] transition-colors duration-[var(--dur-fast)] focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-lime text-lime-ink hover:bg-lime/90",
  secondary: "border border-line text-fg hover:border-line-hi",
  ghost: "text-fg hover:text-lime px-2",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  children,
  href,
  ...rest
}: CommonProps &
  Omit<React.ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
