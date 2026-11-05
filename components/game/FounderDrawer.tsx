"use client";

import { useEffect, useState } from "react";
import { useFounder } from "@/lib/game/FounderContext";
import { BADGES, LEVELS } from "@/lib/game/types";

export function FounderDrawer() {
  const {
    state,
    level,
    nextLevel,
    drawerOpen,
    setDrawerOpen,
    setPref,
    reset,
    isHydrated,
  } = useFounder();

  const [confirmReset, setConfirmReset] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen, setDrawerOpen]);

  if (!isHydrated || !drawerOpen) return null;

  // Calculate percentage
  let pct = 100;
  if (nextLevel) {
    const range = nextLevel.xpNeeded - level.xpNeeded;
    const progress = state.xp - level.xpNeeded;
    pct = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  const unlockedSet = new Set(state.badges);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Founder Profile and Badges"
      className="animate-in fade-in fixed inset-0 z-[70] flex justify-end bg-black/60 backdrop-blur-sm duration-200"
      onClick={() => setDrawerOpen(false)}
    >
      <div
        className="animate-in slide-in-from-right bg-surface flex h-full w-full max-w-md flex-col overflow-hidden border-l border-white/10 text-neutral-100 shadow-2xl duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-bg flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            <h2 className="font-mono text-sm font-bold tracking-widest text-white uppercase">
              FOUNDER XP DOSSIER
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/5 font-mono text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close dossier"
          >
            ✕
          </button>
        </div>

        {/* Content scroll area */}
        <div
          data-lenis-prevent
          className="flex-1 space-y-6 overflow-y-auto overscroll-contain p-6 font-mono"
        >
          {/* Level Progress Card */}
          <div className="from-surface to-bg shadow-card relative overflow-hidden rounded-xl bg-gradient-to-br p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="block text-[11px] tracking-wider text-neutral-400 uppercase">
                  CURRENT STAGE
                </span>
                <span className="text-xl font-bold tracking-tight text-white">
                  Level {level.level} · {level.name}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-emerald-400">
                  {state.xp} XP
                </span>
                <span className="text-[10px] text-neutral-400">
                  {nextLevel ? `Next: ${nextLevel.xpNeeded} XP` : "MAX LEVEL"}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="text-xs text-neutral-400 italic">
              &ldquo;{level.flavour}&rdquo;
            </p>
          </div>

          {/* Startup Stages Milestones */}
          <div>
            <h3 className="mb-3 text-xs tracking-wider text-neutral-400 uppercase">
              VENTURE STAGES
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {LEVELS.map((lvl) => {
                const reached = state.xp >= lvl.xpNeeded;
                return (
                  <div
                    key={lvl.level}
                    className={`rounded-lg border p-2.5 transition-all ${
                      reached
                        ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                        : "border-white/5 bg-white/[0.02] text-neutral-500"
                    }`}
                  >
                    <span className="block text-[10px] opacity-75">
                      LVL {lvl.level}
                    </span>
                    <span className="font-bold">{lvl.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges Collection (16 Badges) */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs tracking-wider text-neutral-400 uppercase">
                FOUNDER BADGES ({state.badges.length} / {BADGES.length})
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {BADGES.map((b) => {
                const isUnlocked = unlockedSet.has(b.id);
                return (
                  <div
                    key={b.id}
                    className={`flex flex-col gap-1 rounded-lg border p-3 transition-all ${
                      isUnlocked
                        ? "bg-sunk border-emerald-500/40 shadow-sm"
                        : "border-white/5 bg-white/[0.02] opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg" aria-hidden="true">
                        {isUnlocked ? b.icon : "🔒"}
                      </span>
                      {isUnlocked && (
                        <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                          UNLOCKED
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold ${isUnlocked ? "text-white" : "text-neutral-400"}`}
                    >
                      {b.name}
                    </span>
                    <span className="text-[10px] leading-tight text-neutral-400">
                      {b.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <h3 className="text-xs tracking-wider text-neutral-400 uppercase">
              PREFERENCES
            </h3>

            {/* Game mode toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="block text-xs font-bold text-white">
                  Game Mode
                </span>
                <span className="block text-[11px] text-neutral-400">
                  Show HUD, XP gains & achievements
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPref("game", !state.prefs.game)}
                className={`cursor-pointer rounded px-3 py-1 text-xs font-bold tracking-wider uppercase transition-colors ${
                  state.prefs.game
                    ? "bg-emerald-500 text-black"
                    : "bg-white/10 text-neutral-400"
                }`}
              >
                {state.prefs.game ? "ON" : "OFF"}
              </button>
            </div>

            {/* Sound toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="block text-xs font-bold text-white">
                  Sound Effects
                </span>
                <span className="block text-[11px] text-neutral-400">
                  Retro synthesizer chimes
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPref("sound", !state.prefs.sound)}
                className={`cursor-pointer rounded px-3 py-1 text-xs font-bold tracking-wider uppercase transition-colors ${
                  state.prefs.sound
                    ? "bg-emerald-500 text-black"
                    : "bg-white/10 text-neutral-400"
                }`}
              >
                {state.prefs.sound ? "ON" : "OFF"}
              </button>
            </div>

            {/* Reset Progress */}
            <div className="pt-2">
              {confirmReset ? (
                <div className="flex items-center justify-between rounded-lg border border-red-500/40 bg-red-950/40 p-3">
                  <span className="text-xs font-bold text-red-300">
                    Wipe all XP & badges?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        reset();
                        setConfirmReset(false);
                      }}
                      className="cursor-pointer rounded bg-red-600 px-2.5 py-1 text-xs font-bold text-white"
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="cursor-pointer rounded bg-white/10 px-2.5 py-1 text-xs text-neutral-300"
                    >
                      NO
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="w-full cursor-pointer rounded-lg border border-red-500/30 py-2 text-xs font-bold text-red-400 transition-all hover:border-red-500/60 hover:bg-red-950/20"
                >
                  RESET PROGRESS
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
