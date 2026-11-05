"use client";

import { useFounder } from "@/lib/game/FounderContext";

export function LevelUpBanner() {
  const { levelUpBanner, dismissBanner, state, isHydrated } = useFounder();

  if (!isHydrated || !state.prefs.game || !levelUpBanner) return null;

  return (
    <aside
      aria-label="Level Up announcement"
      className="animate-in slide-in-from-top-4 fade-in pointer-events-none fixed inset-x-0 top-16 z-[58] flex justify-center px-4 duration-300"
    >
      <div className="bg-bg/95 pointer-events-auto relative flex w-full max-w-xl items-center justify-between gap-4 overflow-hidden rounded-xl border-2 border-emerald-400 p-4 shadow-[0_0_50px_rgba(16,185,129,0.3)] backdrop-blur-lg sm:p-5">
        {/* Subtle pixel particle confetti accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute -top-2 left-1/4 h-3 w-3 rotate-12 animate-bounce bg-emerald-400" />
          <div className="absolute top-1 left-2/3 h-2 w-2 -rotate-45 animate-pulse bg-amber-400" />
          <div className="absolute bottom-2 left-1/3 h-2.5 w-2.5 rotate-45 bg-cyan-400" />
          <div className="absolute right-1/4 -bottom-1 h-3 w-3 rotate-12 bg-purple-400" />
        </div>

        <div className="relative z-10 flex flex-col gap-1 font-mono">
          <div className="flex items-center gap-2">
            <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs font-bold tracking-wider text-emerald-400 uppercase">
              LEVEL UP
            </span>
            <span className="text-base font-bold tracking-tight text-white sm:text-lg">
              → {levelUpBanner.name.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-neutral-300 italic sm:text-sm">
            &ldquo;{levelUpBanner.flavour}&rdquo;
          </p>
        </div>

        <button
          type="button"
          onClick={dismissBanner}
          className="relative z-10 cursor-pointer rounded-md bg-white/10 px-3 py-1.5 font-mono text-xs text-white transition-colors hover:bg-white/20"
          aria-label="Dismiss level up"
        >
          OK
        </button>
      </div>
    </aside>
  );
}
