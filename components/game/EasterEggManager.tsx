"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFounder } from "@/lib/game/FounderContext";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function EasterEggManager() {
  const pathname = usePathname();
  const router = useRouter();
  const { award, isHydrated } = useFounder();
  const konamiIndexRef = useRef(0);
  const [rocketFlying, setRocketFlying] = useState(false);

  // 1. Route visit tracker (Explorer badge & route XP)
  useEffect(() => {
    if (!isHydrated || !pathname) return;
    const cleanRoute = pathname === "/" ? "home" : pathname.replace(/^\//, "");
    award(`visit:${cleanRoute}`, { xp: 20 });
  }, [pathname, isHydrated, award]);

  // 2. Night Owl detector (00:00 - 04:00 local time)
  useEffect(() => {
    if (!isHydrated) return;
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4) {
      award("egg:night-owl", { xp: 50 });
    }
  }, [isHydrated, award]);

  // 3. Konami Code Listener
  useEffect(() => {
    if (!isHydrated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const expectedKey = KONAMI_SEQUENCE[konamiIndexRef.current];
      if (e.key.toLowerCase() === expectedKey?.toLowerCase()) {
        konamiIndexRef.current++;
        if (konamiIndexRef.current === KONAMI_SEQUENCE.length) {
          konamiIndexRef.current = 0;
          award("egg:konami", { xp: 150 });

          // Temporarily flip document to retro 8-bit arcade mode
          document.documentElement.dataset.retroArcade = "true";
          setTimeout(() => {
            delete document.documentElement.dataset.retroArcade;
          }, 10000);
        }
      } else {
        konamiIndexRef.current = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHydrated, award]);

  // 4. DevTools Console Egg (window.ecell.join())
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    console.log(
      `%c
███████╗      ██████╗███████╗██╗     ██╗     
██╔════╝     ██╔════╝██╔════╝██║     ██║     
█████╗ █████╗██║     █████╗  ██║     ██║     
██╔══╝ ╚════╝██║     ██╔══╝  ██║     ██║     
███████╗     ╚██████╗███████╗███████╗███████╗
╚══════╝      ╚═════╝╚══════╝╚══════╝╚══════╝
%cWelcome to E-Cell KCCEMSR · Build Mode.
We are always scouting for engineers, designers, and founders.
Interested? Call %cecell.join()%c in this console to get started.`,
      "color: #10b981; font-family: monospace; font-weight: bold;",
      "color: #94a3b8; font-family: monospace;",
      "color: #38bdf8; font-family: monospace; font-weight: bold; background: #0f172a; padding: 2px 4px; border-radius: 4px;",
      "color: #94a3b8; font-family: monospace;",
    );

    const win = window as unknown as {
      ecell?: {
        join: () => void;
        help: () => void;
      };
    };

    win.ecell = {
      join: () => {
        console.log(
          "%cAccess clearance acknowledged! +100 XP awarded. Navigating to contact...",
          "color: #10b981; font-weight: bold;",
        );
        award("egg:console", { xp: 100 });
        router.push("/contact");
      },
      help: () => {
        console.log(
          "Press ` or Ctrl+K on the site to open the full ecell.sh terminal.",
        );
      },
    };

    // 5. Global listener for custom logo 7-click event
    const handleGlitchEgg = () => {
      award("egg:glitch", { xp: 100 });
      setRocketFlying(true);
      setTimeout(() => {
        setRocketFlying(false);
      }, 2500);
    };

    window.addEventListener("ecell:logo-glitch", handleGlitchEgg);
    return () => {
      window.removeEventListener("ecell:logo-glitch", handleGlitchEgg);
    };
  }, [isHydrated, award, router]);

  return (
    <>
      {/* Tiny rocket flying across screen when logo 7-clicked */}
      {rocketFlying && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[120] text-4xl select-none"
          style={{
            animation: "flyRocket 2.2s ease-in-out forwards",
            bottom: "10%",
            left: "5%",
          }}
        >
          🚀💨
        </div>
      )}
    </>
  );
}
