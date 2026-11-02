"use client";

// Custom cursor: a 10px lime square that becomes a bracket outline over
// interactive elements. Desktop full tier only; the native cursor stays on
// inputs/text (see globals.css). See docs/ANIMATIONS.md §12.
import { useEffect, useRef, useState } from "react";
import { useMotionTier } from "@/components/motion/MotionProvider";
import { cn } from "@/lib/utils";

const INTERACTIVE =
  'a,button,[role="button"],summary,label,input,select,textarea';

export function Cursor() {
  const tier = useMotionTier();
  const dotRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (tier !== "full" || !window.matchMedia("(pointer: fine)").matches)
      return;

    const root = document.documentElement;
    root.classList.add("cursor-custom");

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let shown = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown && dotRef.current) {
        dotRef.current.style.opacity = "1";
        shown = true;
      }
      const over =
        e.target instanceof Element && Boolean(e.target.closest(INTERACTIVE));
      if (over !== activeRef.current) {
        activeRef.current = over;
        setActive(over);
      }
    };

    const loop = () => {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      const el = dotRef.current;
      if (el)
        el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      root.classList.remove("cursor-custom");
    };
  }, [tier]);

  if (tier !== "full") return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed top-0 left-0 z-[var(--z-overlay)] opacity-0 transition-[width,height,border-color,background-color] duration-150",
        active
          ? "border-lime size-8 rounded-sm border bg-transparent"
          : "bg-lime size-2.5",
      )}
    />
  );
}
