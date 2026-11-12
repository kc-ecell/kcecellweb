"use client";

// Per-navigation enter animation. Used via app/(site)/template.tsx, which
// re-mounts on every route change. Phase 1 base is a fade + small rise; the
// lime-scanline View Transition is a Phase 4 upgrade (docs/ANIMATIONS.md §11).
//
// The first page never animates. It arrives as HTML, and starting it hidden
// would keep it blank until hydration, which on a phone is seconds after the
// HTML landed. Only client-side navigations get the fade.
import { useEffect, useState } from "react";
import { useMotionTier } from "@/components/motion/MotionProvider";
import { cn } from "@/lib/utils";

let isFirstPage = true;

export function PageTransition({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const tier = useMotionTier();
  const [enter] = useState(() => !isFirstPage);

  useEffect(() => {
    isFirstPage = false;
  }, []);

  return (
    <div className={cn(className, enter && tier !== "off" && "page-enter")}>
      {children}
    </div>
  );
}
