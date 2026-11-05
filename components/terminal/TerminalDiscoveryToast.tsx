"use client";

import { useEffect, useState } from "react";
import { useFounder } from "@/lib/game/FounderContext";

const HINT_DISMISSED_KEY = "ecell:terminal:hint-dismissed";

export function TerminalDiscoveryToast() {
  const { terminalOpen, setTerminalOpen, isHydrated } = useFounder();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    // Check if user already dismissed or opened terminal in this session
    try {
      const dismissed = sessionStorage.getItem(HINT_DISMISSED_KEY);
      if (dismissed) return;
    } catch {
      // Storage unavailable
    }

    // Show after 3.5s of page load
    const timer = setTimeout(() => {
      setVisible(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, [isHydrated]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(HINT_DISMISSED_KEY, "true");
    } catch {
      // Storage unavailable
    }
  };

  const handleLaunch = () => {
    handleDismiss();
    setTerminalOpen(true);
  };

  if (!visible || terminalOpen) return null;

  return (
    <aside
      aria-label="Secret terminal discovery prompt"
      className="animate-in slide-in-from-top-4 fade-in pointer-events-auto fixed right-5 bottom-20 z-[54] w-[calc(100vw-2.5rem)] max-w-sm duration-300 sm:max-w-md md:top-24 md:bottom-auto"
    >
      <div className="bg-bg/95 relative overflow-hidden rounded-xl border border-emerald-500/40 p-4 font-mono text-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.5)] backdrop-blur-md">
        {/* Subtle accent border line */}
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent" />

        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
              SECRET TERMINAL DISCOVERED
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="cursor-pointer px-1 text-xs text-neutral-500 transition-colors hover:text-white"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-neutral-300">
          This site has a built-in console (
          <span className="font-semibold text-emerald-400">ecell.sh</span>)
          loaded with hidden commands, easter eggs, matrix rain, and founder
          perks.
        </p>

        <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-1">
          <span className="text-[11px] text-neutral-400">
            Press{" "}
            <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-bold text-white">
              ~
            </kbd>{" "}
            or{" "}
            <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-bold text-white">
              Ctrl+K
            </kbd>
          </span>

          <button
            type="button"
            onClick={handleLaunch}
            className="cursor-pointer rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold tracking-wider text-black uppercase shadow-sm transition-colors hover:bg-emerald-400 active:scale-95"
          >
            Launch Terminal &gt;_
          </button>
        </div>
      </div>
    </aside>
  );
}
