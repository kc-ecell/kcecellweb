"use client";

import { useFounder } from "@/lib/game/FounderContext";

// Touch devices have no keyboard shortcut, so phones get a visible way in.
export function TerminalButton() {
  const { terminalOpen, setTerminalOpen } = useFounder();
  if (terminalOpen) return null;

  return (
    <button
      type="button"
      onClick={() => setTerminalOpen(true)}
      aria-label="Open terminal"
      className="fixed right-5 bottom-5 z-[55] flex size-11 cursor-pointer items-center justify-center rounded-full border border-emerald-500/50 bg-[#090a1a] font-mono text-sm font-bold text-emerald-400 shadow-xl active:scale-95 md:hidden"
    >
      &gt;_
    </button>
  );
}
