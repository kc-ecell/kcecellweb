"use client";

// Smooth scroll on the `full` tier only, driven by the GSAP ticker so Lenis
// and ScrollTrigger share one rAF loop. See docs/ANIMATIONS.md §0 / ARCH §6.
// Both load on demand, so phones and the lite tier never download them.
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { useMotionTier } from "@/components/motion/MotionProvider";

export function LenisProvider({ children }: { children: ReactNode }) {
  const tier = useMotionTier();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (tier !== "full") return;

    // Detect touch-only device to avoid hijacking native touch momentum scrolling
    const isTouchOnly =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(hover: hover)").matches;
    if (isTouchOnly) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void Promise.all([import("lenis"), import("@/lib/motion/gsap")]).then(
      ([{ default: LenisClass }, { gsap, ScrollTrigger }]) => {
        if (cancelled) return;

        const lenis = new LenisClass({
          lerp: 0.1,
          smoothWheel: true,
          syncTouch: false,
          autoRaf: false,
        });
        lenisRef.current = lenis;

        lenis.on("scroll", ScrollTrigger.update);

        const onTick = (time: number) => {
          lenis.raf(time * 1000);
        };

        gsap.ticker.add(onTick);
        // Turn off lag smoothing so frame timing remains consistent for Lenis
        gsap.ticker.lagSmoothing(0);

        teardown = () => {
          gsap.ticker.remove(onTick);
          lenis.destroy();
          lenisRef.current = null;
        };
      },
    );

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [tier]);

  // Recalculate scroll dimensions and reset position smoothly on navigation
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    lenis.scrollTo(0, { immediate: true });
    const timer = setTimeout(() => {
      lenis.resize();
    }, 80);

    return () => clearTimeout(timer);
  }, [pathname]);

  return <>{children}</>;
}
