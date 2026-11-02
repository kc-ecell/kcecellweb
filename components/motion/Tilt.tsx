"use client";

// 3D tilt-to-pointer (trading cards). Full tier only; otherwise a plain div.
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMotionTier } from "@/components/motion/MotionProvider";

export function Tilt({
  max = 10,
  className,
  children,
}: {
  max?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const tier = useMotionTier();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 });

  if (tier !== "full") {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * max * 2);
        rx.set(-py * max * 2);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
