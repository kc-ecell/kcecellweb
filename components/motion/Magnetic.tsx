"use client";

// Pointer-pull wrapper (primary CTAs). Full tier only; otherwise a plain span.
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMotionTier } from "@/components/motion/MotionProvider";

export function Magnetic({
  radius = 60,
  strength = 0.3,
  className,
  children,
}: {
  radius?: number;
  strength?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const tier = useMotionTier();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.1 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.1 });

  if (tier !== "full") {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      style={{ x: sx, y: sy, display: "inline-block" }}
      className={className}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(mx, my) < radius) {
          x.set(mx * strength);
          y.set(my * strength);
        }
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
