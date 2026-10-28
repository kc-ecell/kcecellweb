"use client";

// Decode/scramble text. See docs/ANIMATIONS.md §3.
// The final string is server-rendered as the visible text (so it is never the
// LCP blocker and screen readers get it immediately); the scramble only
// overwrites already-painted characters after mount. Same char count in and
// out, so there is zero layout shift. `off` tier shows the final text at once.

import { useEffect, useRef, useState } from "react";
import { useMotionTier } from "@/components/motion/MotionProvider";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#01";

export function ScrambleText({
  text,
  as: Tag = "span",
  className,
}: {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  className?: string;
}) {
  const tier = useMotionTier();
  const [display, setDisplay] = useState(text);
  const frame = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    // `off`: leave the server-rendered final text in place; don't animate.
    if (tier === "off") return;

    const chars = text.split("");
    // Each char resolves after a staggered start, over 3–6 cycles.
    const starts = chars.map((_, i) => i * 1.5);
    const ends = starts.map((s) => s + 3 + Math.floor(Math.random() * 3));
    frame.current = 0;

    const tick = () => {
      const f = frame.current;
      let done = true;
      const out = chars.map((c, i) => {
        if (c === " ") return " ";
        if (f >= ends[i]!) return c;
        done = false;
        if (f < starts[i]!) return "";
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
      });
      setDisplay(out.join(""));
      if (!done) {
        frame.current += 1;
        raf.current = window.setTimeout(() => {
          raf.current = window.requestAnimationFrame(tick);
        }, 28) as unknown as number;
      } else {
        setDisplay(text);
      }
    };

    raf.current = window.requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) {
        window.cancelAnimationFrame(raf.current);
        window.clearTimeout(raf.current);
      }
    };
  }, [text, tier]);

  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </Tag>
  );
}
