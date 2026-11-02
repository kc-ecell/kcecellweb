"use client";

import type { ReactNode } from "react";
import { FounderProvider } from "@/lib/game/FounderContext";
import { FounderHUD } from "./FounderHUD";
import { XPToast } from "./XPToast";
import { LevelUpBanner } from "./LevelUpBanner";
import { FounderDrawer } from "./FounderDrawer";
import { EasterEggManager } from "./EasterEggManager";
import { Terminal } from "@/components/terminal/Terminal";
import { TerminalDiscoveryToast } from "@/components/terminal/TerminalDiscoveryToast";

export function GamificationLayer({ children }: { children: ReactNode }) {
  return (
    <FounderProvider>
      {children}
      <Terminal />
      <TerminalDiscoveryToast />
      <FounderHUD />
      <XPToast />
      <LevelUpBanner />
      <FounderDrawer />
      <EasterEggManager />
    </FounderProvider>
  );
}
