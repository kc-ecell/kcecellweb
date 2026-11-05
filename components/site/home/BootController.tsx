"use client";

// The boot screen animates in pure CSS, so it starts before hydration. This
// island handles skipping, hiding the overlay when the split ends, and replaying
// it on client-side navigation to the home page. See docs/ANIMATIONS.md §1.
import { useEffect, useLayoutEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __ecellBoot?: () => void;
  }
}

const SPLIT_END = new Set(["boot-split-down", "boot-split-down-skip"]);

function clearBoot(html: HTMLElement) {
  delete html.dataset.boot;
  delete html.dataset.bootSkip;
  delete html.dataset.bootDone;
}

export function BootController({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Layout effect: the attribute must land before the new page paints, or the
  // home page flashes and its hero entrance starts without the delay.
  useLayoutEffect(() => {
    const html = document.documentElement;
    if (pathname !== "/") clearBoot(html);
    else if (!html.dataset.boot) window.__ecellBoot?.();
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;

    const skip = () => {
      if (html.dataset.boot && html.dataset.bootDone === undefined) {
        html.dataset.bootSkip = "";
      }
    };
    const onAnimationEnd = (event: AnimationEvent) => {
      if (SPLIT_END.has(event.animationName)) html.dataset.bootDone = "";
      // data-boot delays the hero's entrance. Clearing it any earlier would
      // make the running animation jump.
      if (event.animationName === "hero-settle") clearBoot(html);
    };

    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("animationend", onAnimationEnd);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("animationend", onAnimationEnd);
    };
  }, []);

  return (
    <div className="boot" aria-hidden="true">
      {children}
    </div>
  );
}
