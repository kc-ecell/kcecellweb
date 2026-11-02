"use client";

// Per-navigation enter animation. Used via app/(site)/template.tsx, which
// re-mounts on every route change. Phase 1 base is a fade + small rise; the
// lime-scanline View Transition is a Phase 4 upgrade (docs/ANIMATIONS.md §11).
import { motion } from "motion/react";
import { useMotionTier } from "@/components/motion/MotionProvider";

export function PageTransition({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const tier = useMotionTier();

  if (tier === "off") return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
