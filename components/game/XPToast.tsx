"use client";

import { useFounder } from "@/lib/game/FounderContext";

export function XPToast() {
  const { toasts, dismissToast, state, isHydrated } = useFounder();

  if (!isHydrated || !state.prefs.game || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-16 left-5 z-[56] flex max-w-sm flex-col-reverse gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-bottom-2 fade-in pointer-events-auto flex items-center justify-between gap-3 rounded-lg border border-emerald-500/40 bg-[#0e1022]/95 px-3.5 py-2 text-neutral-100 shadow-2xl backdrop-blur-md duration-200"
        >
          <div className="flex items-center gap-2 font-mono text-xs">
            {toast.xp > 0 && (
              <span className="rounded border border-emerald-500/30 bg-emerald-950/70 px-1.5 py-0.5 text-[11px] font-bold text-emerald-400">
                +{toast.xp} XP
              </span>
            )}

            {toast.badgeName ? (
              <span className="text-neutral-200">
                <span className="font-semibold text-amber-400">Badge:</span>{" "}
                {toast.badgeName}
              </span>
            ) : (
              <span className="text-neutral-300">{toast.title}</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="cursor-pointer px-1 font-mono text-xs text-neutral-500 hover:text-neutral-300"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
