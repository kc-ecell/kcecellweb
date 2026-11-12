"use client";

// Fade + rise on scroll-into-view. off tier renders the final state (no motion);
// full/lite animate. See docs/ANIMATIONS.md §16 (animate transform/opacity only).
//
// Content is visible in the server HTML. Only what starts below the fold is
// hidden, after hydration and before it can be seen, so a slow phone never
// waits on JS to show text, and no-JS visitors get the whole page.
import {
  Children,
  isValidElement,
  useLayoutEffect,
  useRef,
  type ElementType,
} from "react";
import { useMotionTier } from "@/components/motion/MotionProvider";

type Tag = "div" | "section" | "li" | "ul" | "span";

export function Reveal({
  as = "div",
  delay = 0,
  y = 16,
  className,
  children,
}: {
  as?: Tag;
  delay?: number;
  y?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const tier = useMotionTier();
  const ref = useRef<HTMLElement>(null);
  const Comp = as as ElementType;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || tier === "off") return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    el.style.opacity = "0";
    el.style.transform = `translateY(${y}px)`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const timing = `var(--dur-reveal) var(--ease-reveal) ${delay}s`;
        el.style.transition = `opacity ${timing}, transform ${timing}`;
        el.style.opacity = "";
        el.style.transform = "";
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      el.style.opacity = "";
      el.style.transform = "";
    };
  }, [tier, delay, y]);

  return (
    <Comp ref={ref} className={className}>
      {children}
    </Comp>
  );
}

/** Staggers its direct children by wrapping each in a Reveal. */
export function RevealGroup({
  as = "div",
  stagger = 0.06,
  className,
  children,
}: {
  as?: Tag;
  stagger?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const Plain = as;
  return (
    <Plain className={className}>
      {Children.toArray(children).map((child, i) =>
        isValidElement(child) ? (
          <Reveal key={i} delay={i * stagger}>
            {child}
          </Reveal>
        ) : (
          child
        ),
      )}
    </Plain>
  );
}
