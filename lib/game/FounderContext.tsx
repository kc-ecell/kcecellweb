"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";
import {
  type FounderState,
  type LevelInfo,
  type ToastMessage,
  BADGES,
} from "./types";
import {
  loadStoredState,
  saveState,
  getLevelForXP,
  getNextLevel,
  processAward,
  getInitialState,
} from "./engine";
import { soundEngine } from "./sound";

// External Store implementation for useSyncExternalStore
let cachedState: FounderState | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): FounderState {
  if (cachedState === null) {
    cachedState = loadStoredState();
  }
  return cachedState;
}

const SERVER_SNAPSHOT: FounderState = getInitialState();

function getServerSnapshot(): FounderState {
  return SERVER_SNAPSHOT;
}

function setStoreState(next: FounderState) {
  cachedState = next;
  saveState(next);
  listeners.forEach((l) => l());
}

interface FounderContextValue {
  state: FounderState;
  level: LevelInfo;
  nextLevel: LevelInfo | null;
  award: (
    key: string,
    options?: { xp?: number; counter?: string; counterInc?: number },
  ) => void;
  setPref: <K extends keyof FounderState["prefs"]>(
    key: K,
    value: FounderState["prefs"][K],
  ) => void;
  reset: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  levelUpBanner: LevelInfo | null;
  dismissBanner: () => void;
  isHydrated: boolean;
}

const FounderContext = createContext<FounderContextValue | null>(null);

export function FounderProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isHydrated = typeof window !== "undefined";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [levelUpBanner, setLevelUpBanner] = useState<LevelInfo | null>(null);

  const level = getLevelForXP(state.xp);
  const nextLevel = getNextLevel(level.level);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissBanner = useCallback(() => {
    setLevelUpBanner(null);
  }, []);

  const award = useCallback(
    (
      key: string,
      options?: { xp?: number; counter?: string; counterInc?: number },
    ) => {
      const current = getSnapshot();
      const result = processAward(current, key, options);
      if (!result) return;

      // Update external store
      setStoreState(result.state);

      // Sound triggers
      if (result.state.prefs.sound) {
        if (result.leveledUp) {
          soundEngine.playLevelUp();
        } else if (result.newBadges.length > 0) {
          soundEngine.playBadgeUnlock();
        } else if (result.xpAwarded > 0) {
          soundEngine.playXpGain();
        }
      }

      // Level up banner
      if (result.leveledUp) {
        setLevelUpBanner(result.newLevel);
        setTimeout(() => {
          setLevelUpBanner(null);
        }, 3200);
      }

      // Toasts
      if (result.state.prefs.game) {
        const newToastItems: ToastMessage[] = [];

        // Badge toasts
        result.newBadges.forEach((badgeId) => {
          const badgeMeta = BADGES.find((b) => b.id === badgeId);
          newToastItems.push({
            id: `${badgeId}-${Date.now()}-${Math.random()}`,
            xp: 0,
            title: "Badge Unlocked",
            badgeName: badgeMeta
              ? `${badgeMeta.icon} ${badgeMeta.name}`
              : badgeId,
            timestamp: Date.now(),
          });
        });

        // XP toast
        if (result.xpAwarded > 0) {
          newToastItems.push({
            id: `xp-${key}-${Date.now()}`,
            xp: result.xpAwarded,
            title: `+${result.xpAwarded} XP`,
            timestamp: Date.now(),
          });
        }

        if (newToastItems.length > 0) {
          setToasts((curr) => {
            const combined = [...curr, ...newToastItems];
            return combined.slice(-3); // Keep at most 3 in queue
          });

          // Auto-dismiss each after 3.8s
          newToastItems.forEach((t) => {
            setTimeout(() => {
              dismissToast(t.id);
            }, 3800);
          });
        }
      }
    },
    [dismissToast],
  );

  const setPref = useCallback(
    <K extends keyof FounderState["prefs"]>(
      key: K,
      value: FounderState["prefs"][K],
    ) => {
      const current = getSnapshot();
      const next: FounderState = {
        ...current,
        prefs: {
          ...current.prefs,
          [key]: value,
        },
      };
      setStoreState(next);
    },
    [],
  );

  const reset = useCallback(() => {
    const fresh = getInitialState();
    setStoreState(fresh);
    setToasts([]);
    setLevelUpBanner(null);
  }, []);

  return (
    <FounderContext.Provider
      value={{
        state,
        level,
        nextLevel,
        award,
        setPref,
        reset,
        drawerOpen,
        setDrawerOpen,
        terminalOpen,
        setTerminalOpen,
        toasts,
        dismissToast,
        levelUpBanner,
        dismissBanner,
        isHydrated,
      }}
    >
      {children}
    </FounderContext.Provider>
  );
}

export function useFounder() {
  const ctx = useContext(FounderContext);
  if (!ctx) {
    throw new Error("useFounder must be used within a FounderProvider");
  }
  return ctx;
}
