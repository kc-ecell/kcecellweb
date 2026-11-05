"use client";

import { useEffect, useState } from "react";
import { useFounder } from "@/lib/game/FounderContext";

export function FounderHUD() {
  const { state, level, nextLevel, drawerOpen, setDrawerOpen, isHydrated } =
    useFounder();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay appearance slightly on initial load for a smooth non-intrusive entrance
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated || !state.prefs.game || !visible) return null;

  // Calculate percentage to next level
  let pct = 100;
  if (nextLevel) {
    const range = nextLevel.xpNeeded - level.xpNeeded;
    const progress = state.xp - level.xpNeeded;
    pct = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  // 5-block pixel bar indicator: ▰▰▰▱▱
  const filledBlocks = Math.min(5, Math.floor(pct / 20));
  const blocks = Array.from({ length: 5 }, (_, i) =>
    i < filledBlocks ? "▰" : "▱",
  ).join("");

  const isUnicorn = level.name === "Unicorn";

  return (
    <aside
      aria-label="Founder XP status"
      className="pointer-events-auto fixed bottom-5 left-5 z-[55]"
    >
      <button
        type="button"
        onClick={() => setDrawerOpen(!drawerOpen)}
        className={`group flex cursor-pointer items-center gap-3 rounded-full border px-3.5 py-2 font-mono text-xs tracking-wide shadow-xl backdrop-blur-md transition-all duration-300 select-none active:scale-95 ${
          isUnicorn
            ? "border-emerald-400/50 bg-gradient-to-r from-emerald-950/80 via-teal-900/80 to-purple-950/80 text-emerald-300 shadow-emerald-500/20"
            : "bg-bg/90 hover:bg-surface border-white/15 text-neutral-200 hover:border-emerald-500/50"
        }`}
        title="Founder XP · Click to view badges and progress"
      >
        {/* Pulsing indicator */}
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              isUnicorn ? "bg-purple-400" : "bg-emerald-400"
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isUnicorn ? "bg-purple-500" : "bg-emerald-500"
            }`}
          />
        </span>

        {/* Level & Stage */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white uppercase">
            LVL {level.level}
          </span>
          <span className="text-neutral-500">·</span>
          <span
            className={
              isUnicorn
                ? "font-bold text-purple-300"
                : "font-semibold text-emerald-400"
            }
          >
            {level.name.toUpperCase()}
          </span>
        </div>

        {/* Pixel progress blocks */}
        <span
          className="text-[11px] tracking-tighter text-emerald-500/80 transition-colors group-hover:text-emerald-400"
          aria-hidden="true"
        >
          {blocks}
        </span>

        {/* Total XP */}
        <span className="text-[11px] font-medium text-neutral-400">
          {state.xp} XP
        </span>
      </button>
    </aside>
  );
}
