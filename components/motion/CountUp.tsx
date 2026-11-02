"use client";

// Odometer-style count. The server renders the FINAL value (so no-JS and `off`
// show the real number); JS animates 0 → value once, when scrolled into view.
import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useMotionTier } from "@/components/motion/MotionProvider";

export function CountUp({
  value,
  suffix = "",
  durationMs = 1200,
  className,
}: {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const tier = useMotionTier();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [display, setDisplay] = useState(value); // SSR = final value

  useEffect(() => {
    if (tier === "off" || !inView) return;

    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, tier, value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
