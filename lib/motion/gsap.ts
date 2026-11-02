"use client";

// Single GSAP registration point. All of ScrollTrigger / SplitText / DrawSVG
// are free since GSAP 3.13. Register more plugins here as set pieces need them.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
