"use client";

// Fade + rise on scroll-into-view. off tier renders the final state (no motion);
// full/lite animate. See docs/ANIMATIONS.md §16 (animate transform/opacity only).
import { Children, isValidElement } from "react";
import { motion } from "motion/react";
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

  if (tier === "off") {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const Comp = motion[as] as React.ElementType;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.52, delay, ease: [0.16, 1, 0.3, 1] }}
    >
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
