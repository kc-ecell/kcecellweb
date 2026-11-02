import { PageTransition } from "@/components/motion/PageTransition";

// A template re-mounts on every navigation (unlike a layout), so it's the
// right place for the per-page enter animation.
export default function SiteTemplate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PageTransition className="flex flex-1 flex-col">{children}</PageTransition>
  );
}
